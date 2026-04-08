using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class UpdateRequestCourse
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string TargetType { get; set; } = null!;
    [Required]
    public string TargetId { get; set; } = null!;
    [Required]
    // FK -> Teacher
    public string RequestById { get; set; } = null!;
    public DateTime RequestedAt { get; set; }
    public string UpdatedDataJSON { get; set; } = null!; // serialize DTO
    public string Status { get; set; } = "pending"; // pending, approved, rejected
    public string? ReviewById { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ResponseComment { get; set; }

    // Navigation
    [ForeignKey(nameof(RequestById))]
    public Teacher RequestBy { get; set; } = null!;
    [ForeignKey(nameof(ReviewById))]
    public Admin? ReviewBy { get; set; }
}