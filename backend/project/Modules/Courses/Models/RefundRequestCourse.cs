using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class RefundRequestCourse
{
    [Key]
    public string Id { get; set; } = null!;
    public string EnrollmentId { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public decimal RefundAmount { get; set; }
    public decimal ProgressSnapshot { get; set; }
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedBy { get; set; }

    [ForeignKey(nameof(EnrollmentId))]
    public Enrollment_course Enrollment { get; set; } = null!;
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;
    [ForeignKey(nameof(ProcessedBy))]
    public Admin Admin { get; set; } = null!;

}