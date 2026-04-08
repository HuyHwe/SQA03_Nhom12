using System.ComponentModel.DataAnnotations;

public class LessonCardDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    [Required]
    public int Order { get; set; }
    [Required]
    public int? Duration { get; set; }
}