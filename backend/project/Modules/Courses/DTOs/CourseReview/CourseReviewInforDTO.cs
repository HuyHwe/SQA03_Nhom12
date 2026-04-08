public class CourseReviewInforDTO
{
    public string Id { get; set; } = null!;
    public string CourseId { get; set; } = null!;
    public string CourseTitle { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string? StudentName { get; set; }
    public string? StudentAvatarUrl { get; set; }
    public string? Comment { get; set; }
    public double? Rating { get; set; }
    public bool IsNewest { get; set; }
    public string? ParentId { get; set; }
    public DateTime CreatedAt { get; set; }
}