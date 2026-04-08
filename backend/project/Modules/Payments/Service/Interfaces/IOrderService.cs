using System;
using project.Modules.Payment.DTOs;

namespace project.Modules.Payment.Service.Interfaces;

public interface IOrderService
{
      Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, string studentId);
      Task<OrderResponseDto?> GetOrderByIdAsync(string orderId, string studentId);
}
