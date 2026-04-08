using System.ComponentModel.DataAnnotations;

public class CourseUpdateDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required]
    public string CategoryId { get; set; } = null!;
    [Required, Range(0, 10000000.0)]
    public decimal Price { get; set; }
    [Range(0, 100.0)]
    public decimal? DiscountPrice { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Introduce { get; set; }
}