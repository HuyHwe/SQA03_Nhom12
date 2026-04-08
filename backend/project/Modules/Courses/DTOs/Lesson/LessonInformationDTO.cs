using System.ComponentModel.DataAnnotations;

public class LessonInformationDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string CourseContentId { get; set; } = null!;
    public string CourseId { get; set; } = null!;
    public string CourseTitle { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    public string? VideoUrl { get; set; }
    [Required, Range(0, int.MaxValue)]
    public int Order { get; set; }
    [Range(0, int.MaxValue)]
    public int? Duration { get; set; }
    public string? TextContent { get; set; }
}