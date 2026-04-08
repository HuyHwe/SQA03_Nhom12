using System.ComponentModel.DataAnnotations;

public class LessonUpdateDTO
{
    public string Id { get; set; } = null!;
    [Required]
    public string? Title { get; set; }
    public string? TextContent { get; set; }
    [Required, Range(0, int.MaxValue)]
    public int Order { get; set; } = 0;
    public string? VideoUrl { get; set; }
    [Range(0, int.MaxValue)]
    public int? Duration { get; set; }
}