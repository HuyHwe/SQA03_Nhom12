using System.ComponentModel.DataAnnotations;

public class LessonOrderDTO
{
    [Required]
    public string LessonId { get; set; } = null!;
    [Required]
    public int Order { get; set; }
}