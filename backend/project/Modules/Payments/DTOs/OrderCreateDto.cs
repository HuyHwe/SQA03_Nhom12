using System;

namespace project.Modules.Payment.DTOs;

public class OrderCreateDto
{
    public List<OrderDetailCreateDto> OrderDetails { get; set; } = new();
}
