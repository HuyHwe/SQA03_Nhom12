using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class AdminReviewCourse
{
    [Key]
    public string Id { get; set; } = null!;
    [Required]
    public string CourseId { get; set; } = null!;
    [Required]
    public string AdminId { get; set; } = null!;
    [Required]
    public string Status { get; set; } = null!;
    [Required]
    public DateTime ReviewedAt { get; set; }
    [Required]
    public DateTime EndedAt { get; set; }
    public int AllowedLessonCount { get; set; }
    public string? Reason { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;
    [ForeignKey(nameof(AdminId))]
    public Admin Admin { get; set; } = null!;
}