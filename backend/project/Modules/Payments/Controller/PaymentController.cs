using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using project.Modules.Payments.DTOs;
using project.Modules.Payments.Service.Interfaces;

namespace project.Modules.Payments.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Lấy QR code thanh toán (legacy)
        /// </summary>
        [HttpGet("{paymentId}/qr")]
        [Authorize]
        [ProducesResponseType(typeof(PaymentQrDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetPaymentQr(string paymentId)
        {
            try
            {
                var studentId = User.FindFirst("StudentId")?.Value ?? throw new Exception("StudentId not found in token");
                var qrDto = await _paymentService.GeneratePaymentQrAsync(paymentId, studentId);
                return Ok(qrDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin ngân hàng và QR code để thanh toán cho Order
        /// </summary>
        /// <param name="orderId">ID của Order cần thanh toán</param>
        /// <returns>Thông tin ngân hàng, số tiền, nội dung CK và QR code</returns>
        [HttpGet("bank-info/{orderId}")]
        [Authorize]
        [ProducesResponseType(typeof(BankInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetBankInfo(string orderId)
        {
            try
            {
                var studentId = User.FindFirst("StudentId")?.Value ?? throw new Exception("StudentId not found in token");
                var bankInfo = await _paymentService.GetBankInfoForOrderAsync(orderId, studentId);
                return Ok(bankInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Webhook callback từ cổng thanh toán (generic)
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PaymentWebhook([FromBody] PaymentWebhookDto dto)
        {
            try
            {
                await _paymentService.HandleWebhookAsync(dto);
                return Ok(new { message = "Payment confirmed and order updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Webhook từ Sepay - Nhận thông báo giao dịch tự động
        /// </summary>
        /// <remarks>
        /// Endpoint này được Sepay gọi tự động khi có giao dịch chuyển khoản vào tài khoản.
        /// 
        /// **Cấu hình Webhook URL:** https://unmetered-elvera-perennially.ngrok-free.dev/api/Payment/webhook/sepay
        /// 
        /// **Format nội dung chuyển khoản:** ELN&lt;orderId&gt;
        /// 
        /// Ví dụ: ELNabc123, ELN123456
        /// 
        /// **Quy trình:**
        /// 1. Khách hàng chuyển khoản với nội dung ELN&lt;orderId&gt;
        /// 2. Sepay phát hiện giao dịch và gọi webhook này
        /// 3. Hệ thống parse OrderId từ content
        /// 4. Kiểm tra số tiền và cập nhật Order status = "paid"
        /// 5. Tự động enroll học viên vào các khóa học
        /// 6. Trả response success: true với status code 201
        /// 
        /// **Response yêu cầu:**
        /// - Success: {"success": true, ...} với HTTP 201
        /// - Error: {"success": false, ...} với HTTP 200
        /// </remarks>
        /// <param name="dto">Dữ liệu webhook từ Sepay</param>
        [HttpPost("webhook/sepay")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SepayWebhook([FromBody] SepayWebhookDto dto)
        {
            try
            {
                await _paymentService.HandleSepayWebhookAsync(dto);
                
                // Sepay yêu cầu response với success: true và status code 200 hoặc 201
                return StatusCode(201, new { 
                    success = true,
                    message = "Payment processed successfully",
                    transactionId = dto.ReferenceCode 
                });
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Sepay webhook error: {ex.Message}");
                Console.WriteLine($"Transaction content: {dto.Content}");
                Console.WriteLine($"Amount: {dto.TransferAmount}");
                
                // Vẫn trả success: false với status 200 để Sepay biết đã nhận được
                // Sepay sẽ retry nếu không thỏa điều kiện
                return Ok(new { 
                    success = false,
                    message = ex.Message 
                });
            }
        }
    }
}
