using System.ComponentModel.DataAnnotations;

public class FullCourseContentUpdateDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Introduce { get; set; }
    public List<LessonUpdateDTO> Lessons { get; set; } = [];
}