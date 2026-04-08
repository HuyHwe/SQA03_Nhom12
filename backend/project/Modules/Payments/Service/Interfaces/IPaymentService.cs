using System;
using project.Modules.Payments.DTOs;

namespace project.Modules.Payments.Service.Interfaces;

public interface IPaymentService
{
  Task<PaymentQrDto> GeneratePaymentQrAsync(string paymentId, string studentId);
  Task<bool> HandleWebhookAsync(PaymentWebhookDto dto);
  Task<bool> HandleSepayWebhookAsync(SepayWebhookDto dto);
  Task<BankInfoDto> GetBankInfoForOrderAsync(string orderId, string studentId);
}
