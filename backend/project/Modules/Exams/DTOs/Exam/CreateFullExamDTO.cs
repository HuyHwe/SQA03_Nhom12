using System.ComponentModel.DataAnnotations;

public class CreateFullExamDTO
{
    public string? CourseContentId { get; set; }
    public string? LessonId { get; set; }
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required, Range(1, 300)]
    public int DurationMinutes { get; set; }
    [Required]
    public List<CreateFullQuestionExamDTO> Questions { get; set; } = [];
}