using System.ComponentModel.DataAnnotations;

public class FullCourseContentCreateDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Introduce { get; set; }
    public List<LessonCreateDTO> Lessons { get; set; } = [];
}