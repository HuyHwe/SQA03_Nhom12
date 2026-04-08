using System.ComponentModel.DataAnnotations;

public class LessonCreateDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? VideoUrl { get; set; }
    [Required, Range(0, int.MaxValue)]
    public int Order { get; set; } = 0;
    [Range(0, int.MaxValue)]
    public int? Duration { get; set; }
    public string? TextContent { get; set; }
}