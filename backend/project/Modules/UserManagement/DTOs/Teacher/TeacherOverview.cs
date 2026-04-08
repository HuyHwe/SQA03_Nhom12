public class TeacherOverview
{
    public InstructorStatisticDTO Statistics { get; set; } = null!;
    public RecentEnrollmentOfTeacherDTO RecentEnrollments { get; set; } = null!;
    public RecentCourseReviewDTO RecentReviews { get; set; } = null!;
    public IEnumerable<CourseInformationDTO> TopCourses { get; set; } = null!;
}