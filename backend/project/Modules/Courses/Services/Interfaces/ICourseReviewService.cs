public interface ICourseReviewService
{
    Task<bool> CheckReviewedCourseAsync(string courseId, string studentId);
    Task AddCourseReviewAsync(string courseId, string studentId, CourseReviewCreateDTO courseReviewCreateDTO);
    Task UpdateCourseReviewAsync(string reviewId, CourseReviewUpdateDTO courseReviewUpdateDTO);
    Task<IEnumerable<CourseReviewInforDTO>> GetAllReviewsByCourseIdAsync(string courseId);
    Task<IEnumerable<CourseReviewInforDTO>> GetReviewsByStudentIdAsync(string studentId);
}