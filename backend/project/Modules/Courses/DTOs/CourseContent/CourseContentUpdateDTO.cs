using System.ComponentModel.DataAnnotations;

public class CourseContentUpdateDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Introduce { get; set; }
}