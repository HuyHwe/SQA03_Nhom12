
public class TeacherService : ITeacherService
{
    private readonly ITeacherRepository _teacherRepository;
    private readonly IEnrollmentCourseRepository _enrollmentCourseRepository;
    private readonly ICourseReviewRepository _courseReviewRepository;
    private readonly ICourseRepository _courseRepository;
    public TeacherService(
        ITeacherRepository teacherRepository,
        IEnrollmentCourseRepository enrollmentCourseRepository,
        ICourseReviewRepository courseReviewRepository,
        ICourseRepository courseRepository)
    {
        _teacherRepository = teacherRepository;
        _enrollmentCourseRepository = enrollmentCourseRepository;
        _courseReviewRepository = courseReviewRepository;
        _courseRepository = courseRepository;
    }
    public async Task<TeacherOverview> GetTeacherOverviewAsync(string teacherId)
    {
        var teacherStatistic = await _teacherRepository.GetInstructorStatisticsAsync(teacherId);
        var recentEnrollments = await _enrollmentCourseRepository.GetRecentEnrollmentsOfTeacherAsync(teacherId, 5);

        var recentEnrollmentDTOs = recentEnrollments.Select(en => new EnrollmentInforDTO
        {
            StudentId = en.StudentId ?? "Unknown",
            StudentName = en.Student?.User?.FullName ?? "Unknown",
            CourseId = en.CourseId ?? "Unknown",
            CourseName = en.Course?.Title ?? "Unknown Title",
            EnrolledAt = en.EnrolledAt,
            Progress = en.Progress,
            Status = en.Status ?? "Unknown",
            CertificateUrl = en.CertificateUrl ?? "Unknown"
        });

        var recentReviews = await _courseReviewRepository.GetRecentCourseReviewsOfTeacherAsync(teacherId, 5);
        var recentReviewDTOs = recentReviews.Select(r => new CourseReviewInforDTO
        {
            Id = r.Id,
            CourseId = r.CourseId ?? "Unknown",
            CourseTitle = r.Course?.Title ?? "Unknown Title",
            StudentId = r.StudentId ?? "Unknown",
            StudentName = r.Student?.User?.FullName ?? "Unknown",
            Rating = r.Rating,
            Comment = r.Comment ?? "",
            CreatedAt = r.CreatedAt
        });

        var topCourses = await _courseRepository.GetTopCoursesByTeacherAsync(teacherId, 5);

        return new TeacherOverview
        {
            Statistics = teacherStatistic,
            RecentEnrollments = new RecentEnrollmentOfTeacherDTO
            {
                RecentEnrollments = recentEnrollmentDTOs
            },
            RecentReviews = new RecentCourseReviewDTO
            {
                RecentReviews = recentReviewDTOs
            },
            TopCourses = topCourses.Select(c => new CourseInformationDTO
            {
                Id = c.Id,
                Title = c.Title,
                CategoryName = c.Category?.Name ?? "Unknown",
                ReviewCount = c.ReviewCount,
                AverageRating = c.AverageRating,
                EnrollmentCount = c.Enrollments.Count,
                CreatedAt = c.CreatedAt,
                ThumbnailUrl = c.ThumbnailUrl ?? "",
                Price = c.Price,
                DiscountPrice = c.DiscountPrice,
            })
        };
    }
}