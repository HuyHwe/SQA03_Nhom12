using System;

namespace project.Modules.Payment.DTOs;


// Dto trả về client sau khi tạo Order
public class OrderResponseDto
{
    public string OrderId { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
