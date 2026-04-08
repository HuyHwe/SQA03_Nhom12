using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models;

public class Payment
{

    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string OrderId { get; set; } = null!;

    [Required, MaxLength(100)]
    public string TransactionId { get; set; } = null!;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(OrderId))]
    public Orders Order { get; set; } = null!;

}
