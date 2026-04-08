using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using project.Models;
using project.Modules.Payments.DTOs;
using project.Modules.Payments.Repositories.Interfaces;
using project.Modules.Payments.Service.Interfaces;
using QRCoder;

namespace project.Modules.Payments.Service.Implements;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly DBContext _dbContext;
    private readonly IConfiguration _configuration;

    public PaymentService(IPaymentRepository paymentRepo, DBContext dbContext, IConfiguration configuration)
    {
        _paymentRepo = paymentRepo;
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<PaymentQrDto> GeneratePaymentQrAsync(string paymentId, string studentId)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId);
        if (payment == null)
            throw new Exception("Payment not found.");

        if (payment.Order.StudentId != studentId)
            throw new Exception("You are not allowed to access this payment.");

        // Tạo QR duy nhất bằng cách thêm timestamp/nonce
        var nonce = Guid.NewGuid().ToString(); // mỗi lần gọi khác nhau
        string paymentUrl = $"https://your-payment-gateway.com/pay?transactionId={payment.TransactionId}&amount={payment.Amount}&nonce={nonce}";

        using var qrGenerator = new QRCoder.QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(paymentUrl, QRCoder.QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new QRCoder.QRCode(qrData);
        using var bitmap = qrCode.GetGraphic(20);
        using var ms = new MemoryStream();
        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
        string qrBase64 = Convert.ToBase64String(ms.ToArray());

        return new PaymentQrDto
        {
            PaymentId = payment.Id,
            TransactionId = payment.TransactionId,
            OrderId = payment.OrderId,
            Amount = payment.Amount,
            Status = payment.Order.Status,
            CreatedAt = payment.CreatedAt,
            QrCode = $"data:image/png;base64,{qrBase64}"
        };
    }

    // Xử lý webhook callback từ cổng thanh toán
    public async Task<bool> HandleWebhookAsync(PaymentWebhookDto dto)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var payment = await _paymentRepo.GetByTransactionIdAsync(dto.TransactionId);
            if (payment == null)
                throw new Exception("Payment not found.");

            if (dto.Status != "success")
                throw new Exception("Payment not successful.");

            var order = payment.Order;
            if (order.Status == "paid")
                return true; // đã thanh toán rồi

            // Cập nhật order
            order.Status = "paid";
            order.UpdatedAt = DateTime.UtcNow;
            _dbContext.Orders.Update(order);

            // Cập nhật payment UpdatedAt
            payment.UpdatedAt = DateTime.UtcNow;
            _dbContext.Payments.Update(payment);

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // Xử lý webhook từ Sepay
    public async Task<bool> HandleSepayWebhookAsync(SepayWebhookDto dto)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Log để debug
            Console.WriteLine($"[Sepay Webhook] Received:");
            Console.WriteLine($"  - ID: {dto.Id}");
            Console.WriteLine($"  - Code: {dto.Code}");
            Console.WriteLine($"  - Content: {dto.Content}");
            Console.WriteLine($"  - Amount: {dto.TransferAmount}");
            Console.WriteLine($"  - Type: {dto.TransferType}");

            // Chỉ xử lý giao dịch tiền vào
            if (dto.TransferType != "in")
                throw new Exception("Only process incoming transactions.");

            // Kiểm tra số tiền hợp lệ
            if (dto.TransferAmount <= 0)
                throw new Exception("Invalid transfer amount.");

            // Parse OrderId từ Content (ưu tiên vì có đầy đủ)
            string? orderId = ExtractOrderIdFromContent(dto.Content);
            Console.WriteLine($"  - OrderId from Content: {orderId}");
            
            // Fallback: Lấy từ Code field nếu Content không parse được
            if (string.IsNullOrEmpty(orderId) && !string.IsNullOrEmpty(dto.Code))
            {
                if (dto.Code.StartsWith("ELN", StringComparison.OrdinalIgnoreCase))
                {
                    orderId = dto.Code.Substring(3);
                    Console.WriteLine($"  - OrderId from Code (fallback): {orderId}");
                }
            }
            
            if (string.IsNullOrEmpty(orderId))
                throw new Exception("Cannot extract OrderId from transaction. Format: ELN<orderId>");
            
            // Nếu OrderId là GUID không có dấu gạch (32 chars), thêm dấu gạch
            if (orderId.Length == 32 && !orderId.Contains("-"))
            {
                orderId = $"{orderId.Substring(0, 8)}-{orderId.Substring(8, 4)}-{orderId.Substring(12, 4)}-{orderId.Substring(16, 4)}-{orderId.Substring(20, 12)}";
                Console.WriteLine($"  - OrderId formatted with dashes: {orderId}");
            }
            
            Console.WriteLine($"  - Final OrderId: {orderId}");

            // Tìm Order
            var order = await _dbContext.Orders
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new Exception($"Order {orderId} not found.");

            // Kiểm tra đã thanh toán chưa (idempotent)
            if (order.Status == "paid")
                return true;

            // Kiểm tra số tiền
            if (dto.TransferAmount < order.TotalPrice)
                throw new Exception($"Amount mismatch. Expected: {order.TotalPrice}, Received: {dto.TransferAmount}");

            // Tạo Payment record
            var payment = new Models.Payment
            {
                Id = Guid.NewGuid().ToString(),
                OrderId = order.Id,
                TransactionId = dto.ReferenceCode, // Sepay reference code
                Amount = dto.TransferAmount,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _dbContext.Payments.AddAsync(payment);

            // Cập nhật Order status
            order.Status = "paid";
            order.UpdatedAt = DateTime.UtcNow;
            _dbContext.Orders.Update(order);

            // Tự động enroll các khóa học trong OrderDetails
            var orderDetails = await _dbContext.OrderDetails
                .Where(od => od.OrderId == orderId)
                .ToListAsync();

            foreach (var detail in orderDetails)
            {
                // Kiểm tra đã enroll chưa
                var existingEnrollment = await _dbContext.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == order.StudentId && e.CourseId == detail.CourseId);

                if (existingEnrollment == null)
                {
                    var enrollment = new Enrollment_course
                    {
                        Id = Guid.NewGuid().ToString(),
                        StudentId = order.StudentId,
                        CourseId = detail.CourseId,
                        EnrolledAt = DateTime.UtcNow,
                        Status = "active"
                    };
                    await _dbContext.Enrollments.AddAsync(enrollment);
                }
            }

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // Helper: Extract OrderId từ transaction content
    // Format: "ELN<orderId>" - VD: "ELNabc123", "ELN123456"
    private string? ExtractOrderIdFromContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return null;

        // Tìm pattern "ELN" theo sau bởi GUID (có hoặc không có dấu gạch ngang)
        // Format 1: ELN68d22c88-1063-4e30-990c-0e153c979780 (36 chars với dấu gạch)
        // Format 2: ELN68d22c881063-4e30990c0e153c979780 (32 chars không dấu gạch)
        var match = System.Text.RegularExpressions.Regex.Match(
            content, 
            @"ELN([a-fA-F0-9\-]{32,36})", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
        
        if (!match.Success)
            return null;

        var orderIdRaw = match.Groups[1].Value;
        
        // Nếu là GUID không có dấu gạch (32 chars), thêm dấu gạch vào
        // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        if (orderIdRaw.Length == 32 && !orderIdRaw.Contains("-"))
        {
            return $"{orderIdRaw.Substring(0, 8)}-{orderIdRaw.Substring(8, 4)}-{orderIdRaw.Substring(12, 4)}-{orderIdRaw.Substring(16, 4)}-{orderIdRaw.Substring(20, 12)}";
        }
        
        // Nếu đã có dấu gạch (36 chars), trả về luôn
        return orderIdRaw;
    }

    // Lấy thông tin ngân hàng để hiển thị cho khách hàng
    public async Task<BankInfoDto> GetBankInfoForOrderAsync(string orderId, string studentId)
    {
        var order = await _dbContext.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId && o.StudentId == studentId);

        if (order == null)
            throw new Exception("Order not found or access denied.");

        if (order.Status == "paid")
            throw new Exception("Order already paid.");

        var bankAccount = _configuration["Sepay:BankAccount"] ?? "0972229142";
        var bankName = _configuration["Sepay:BankName"] ?? "MB";
        var accountHolder = _configuration["Sepay:AccountHolder"] ?? "NGUYEN VAN A";

        // Format nội dung: ELN<orderId> (remove dấu gạch ngang để Sepay dễ parse)
        var orderIdClean = orderId.Replace("-", "");
        var transferContent = $"ELN{orderIdClean}";

        // Tạo QR code URL từ VietQR
        var qrCodeUrl = GenerateSepayQrCode(bankAccount, bankName, order.TotalPrice, transferContent);

        return new BankInfoDto
        {
            OrderId = orderId,
            Amount = order.TotalPrice,
            BankAccount = bankAccount,
            BankName = bankName,
            AccountHolder = accountHolder,
            TransferContent = transferContent,
            QrCodeUrl = qrCodeUrl
        };
    }

    // Helper: Tạo QR code cho chuyển khoản
    private string GenerateSepayQrCode(string bankAccount, string bankName, decimal amount, string content)
    {
        // Sử dụng Sepay QR API
        // https://qr.sepay.vn/img?acc={account}&bank={bank}&amount={amount}&des={content}&template=compact
        // Convert amount to int (Sepay không chấp nhận số thập phân)
        var amountInt = (int)Math.Round(amount);
        var qrUrl = $"https://qr.sepay.vn/img?acc={bankAccount}&bank={bankName}&amount={amountInt}&des={Uri.EscapeDataString(content)}&template=compact";
        return qrUrl;
    }
}
