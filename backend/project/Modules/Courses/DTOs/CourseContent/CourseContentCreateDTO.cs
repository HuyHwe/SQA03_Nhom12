using System.ComponentModel.DataAnnotations;

public class CourseContentCreateDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Introduce { get; set; }
}