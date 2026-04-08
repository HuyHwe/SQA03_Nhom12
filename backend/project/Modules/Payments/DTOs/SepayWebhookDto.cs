using System.Text.Json.Serialization;

namespace project.Modules.Payments.DTOs;

/// <summary>
/// DTO nhận webhook từ Sepay
/// Docs: https://docs.sepay.vn/webhook
/// </summary>
public class SepayWebhookDto
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("gateway")]
    public string Gateway { get; set; } = null!; // Vietcombank, MB Bank, etc.

    [JsonPropertyName("transactionDate")]
    public string TransactionDate { get; set; } = null!;

    [JsonPropertyName("accountNumber")]
    public string AccountNumber { get; set; } = null!;

    [JsonPropertyName("subAccount")]
    public string? SubAccount { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = null!;

    [JsonPropertyName("transferType")]
    public string TransferType { get; set; } = null!; // "in" hoặc "out"

    [JsonPropertyName("transferAmount")]
    public decimal TransferAmount { get; set; }

    [JsonPropertyName("accumulated")]
    public decimal Accumulated { get; set; }

    [JsonPropertyName("referenceCode")]
    public string ReferenceCode { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
