using System.ComponentModel.DataAnnotations;

public class FullCourseDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Required]
    public string CategoryId { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public string TeacherId { get; set; } = null!;
    public string TeacherName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string ReviewStatus { get; set; } = null!;
    public string? ReviewByAdminId { get; set; }
    public string? ReviewByAdminName { get; set; }
    [Required, Range(0, double.MaxValue)]
    public double Price { get; set; }
    [Range(1, 99)]
    public double? Discount { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    [Required]
    public FullCourseContentDTO CourseContent { get; set; } = null!;
}