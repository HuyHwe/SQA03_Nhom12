using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Posts;

public class Reports
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string? ReporterId { get; set; }

    [MaxLength(50)]
    public string? TargetType { get; set; } // Ví dụ: "Post", "Discussion", "ForumQuestion"

    public string? TargetTypeId { get; set; }

    [MaxLength(255)]
    public string? Reason { get; set; }  // lý do báo cáo (vi phạm, spam, ngôn từ, ...)

    public string? Description { get; set; } // mô tả chi tiết

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending | Reviewed | Rejected | Resolved

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    [ForeignKey(nameof(ReporterId))]
    public Student Student { get; set; } = null!;
}

