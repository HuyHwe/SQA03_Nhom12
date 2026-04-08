using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Order;

public class TeacherPayout
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // FK đến bảng Teacher
    [Required]
    public string TeacherId { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    public int Year { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EarningPrice { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Paid, Cancelled...

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public Teacher Teacher { get; set; } = null!;

}
