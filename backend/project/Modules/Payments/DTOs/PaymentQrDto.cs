using System;

namespace project.Modules.Payments.DTOs;

public class PaymentQrDto
{
    public string PaymentId { get; set; } = null!;
    public string TransactionId { get; set; } = null!;
    public string OrderId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string QrCode { get; set; } = null!;
}
