public class RefundRequestCourseDTO
{
    public string Id { get; set; } = null!;
    public string EnrollmentId { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string StudentName { get; set; } = null!;
    public string CourseId { get; set; } = null!;
    public string CourseTitle { get; set; } = null!;
    public decimal RefundAmount { get; set; }
    public decimal ProgressSnapshot { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedBy { get; set; }
}