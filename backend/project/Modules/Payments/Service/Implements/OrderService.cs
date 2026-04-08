using System;
using project.Models;
using project.Modules.Payment.DTOs;
using project.Modules.Payments.Repositories.Interfaces;
using project.Modules.Payment.Service.Interfaces;


public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IPaymentRepository _paymentRepo;
    private readonly DBContext _dbContext;

    public OrderService(IOrderRepository orderRepo, ICourseRepository courseRepo,
     IPaymentRepository paymentRepo, DBContext dbContext)
    {
        _orderRepo = orderRepo;
        _courseRepo = courseRepo;
        _paymentRepo = paymentRepo;
        _dbContext = dbContext;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, string studentId)
    {
        if (dto.OrderDetails == null || !dto.OrderDetails.Any())
            throw new Exception("Order must have at least one course.");

        // Dùng DbContext để quản lý transaction
        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var order = new Orders
            {
                StudentId = studentId,
                Status = "pending",
                TotalPrice = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            foreach (var detail in dto.OrderDetails)
            {
                var course = await _courseRepo.GetCourseByIdAsync(detail.CourseId);
                if (course == null || course.Status != "published")
                    throw new Exception($"Course {detail.CourseId} does not exist or is not published.");

                // Tính giá sau giảm: DiscountPrice là %
                decimal priceToUse = course.Price;
                if (course.DiscountPrice.HasValue && course.DiscountPrice.Value > 0)
                    priceToUse = course.Price * (1 - course.DiscountPrice.Value / 100m);

                order.OrderDetails.Add(new OrderDetail
                {
                    CourseId = course.Id,
                    Price = priceToUse
                });

                order.TotalPrice += priceToUse;
            }

            // Lưu Order
            await _orderRepo.AddAsync(order);
            await _orderRepo.SaveChangesAsync();

            // Tạo Payment pending
            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = order.TotalPrice,
                TransactionId = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _paymentRepo.AddAsync(payment);
            await _paymentRepo.SaveChangesAsync();

            // Commit transaction
            await transaction.CommitAsync();

            return new OrderResponseDto
            {
                OrderId = order.Id,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            };
        }
        catch
        {
            // Rollback nếu có lỗi
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(string orderId, string studentId)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        
        if (order == null)
            return null;

        // Kiểm tra quyền truy cập
        if (order.StudentId != studentId)
            throw new UnauthorizedAccessException("You don't have permission to access this order.");

        return new OrderResponseDto
        {
            OrderId = order.Id,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            CreatedAt = order.CreatedAt
        };
    }
}

