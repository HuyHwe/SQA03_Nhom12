namespace project.Modules.Payments.DTOs;

/// <summary>
/// DTO trả thông tin ngân hàng để khách hàng chuyển khoản
/// </summary>
public class BankInfoDto
{
    public string OrderId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string BankAccount { get; set; } = null!;
    public string BankName { get; set; } = null!;
    public string AccountHolder { get; set; } = null!;
    public string TransferContent { get; set; } = null!; // "ORDER <orderId>"
    public string QrCodeUrl { get; set; } = null!; // URL QR code từ Sepay
}
