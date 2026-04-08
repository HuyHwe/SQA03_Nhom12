using System.ComponentModel.DataAnnotations;

public class CreateExamDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required, Range(1, 300)]
    public int DurationMinutes { get; set; }
    public string? CourseContentId { get; set; }
    public string? LessonId { get; set; }
}