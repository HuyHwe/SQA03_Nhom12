public class EnrollmentInforDTO
{
    public string StudentId { get; set; } = null!;
    public string StudentName { get; set; } = null!;
    public string CourseId { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public DateTime EnrolledAt { get; set; }
    public decimal Progress { get; set; }
    public string Status { get; set; } = null!;
    public string? CertificateUrl { get; set; }
}