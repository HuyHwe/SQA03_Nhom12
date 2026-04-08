using System.ComponentModel.DataAnnotations;

public class FullCourseUpdateDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required]
    public string CategoryId { get; set; } = null!;
    [Required, Range(0, double.MaxValue)]
    public double Price { get; set; }
    [Range(1, 99)]
    public double? Discount { get; set; }
    public string? Thumbnail { get; set; }
    [Required]
    public FullCourseContentUpdateDTO CourseContent { get; set; } = null!;
}