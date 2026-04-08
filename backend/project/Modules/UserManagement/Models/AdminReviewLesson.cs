using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class AdminReviewLesson
{
    [Key]
    public string Id { get; set; } = null!;
    [Required]
    public string LessonId { get; set; } = null!;
    [Required]
    public string CourseId { get; set; } = null!;
    [Required]
    public string AdminId { get; set; } = null!;
    public string? Note { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;
    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;
    [ForeignKey(nameof(AdminId))]
    public Admin Admin { get; set; } = null!;
}