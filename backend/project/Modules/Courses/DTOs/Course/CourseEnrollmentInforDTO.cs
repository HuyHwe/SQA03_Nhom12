public class CourseEnrollmentInforDTO
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string Status { get; set; } = null!;
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public double Progress { get; set; }

    public string? CategoryId { get; set; }
    public string? CategoryName { get; set; }

    public string? TeacherId { get; set; }
    public string? TeacherName { get; set; }
}