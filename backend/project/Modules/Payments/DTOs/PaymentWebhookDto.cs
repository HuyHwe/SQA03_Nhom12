using System;

namespace project.Modules.Payments.DTOs;

public class PaymentWebhookDto
{
    public string TransactionId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
}
