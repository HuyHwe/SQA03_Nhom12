using project.Models;

public interface IAdminRepository
{
    // Admin methods for managing courses
    Task<(IEnumerable<Course>, int)> GetCoursesByAdminAsync(string? status, int page, int pageSize);
    Task<Course?> GetFullCourseByIdAsync(string courseId);
    Task<AdminReviewCourse?> GetAdminReviewCourseRecordAsync(string courseId);
    Task<IEnumerable<UpdateRequestCourse>> GetUpdateRequestsByStatusAsync(string status);
    Task<IEnumerable<UpdateRequestCourse>> GetAllUpdateRequestsAsync();
    Task<IEnumerable<RefundRequestCourse>> GetRefundRequestsByStatusAsync(string status);
    Task<bool> IsAdminExistAsync(string userId);
    Task<string> GetAdminIdAsync(string userId);
    Task<string> GetAdminNameAsync(string adminId);
    Task AdminReviewCourseAsync(AdminReviewCourse adminReviewCourse);
    Task<bool> UpdateAdminReviewCourseAsync(string courseId, string status, string? rejectReason);
    Task<bool> IsAdminReviewCourseRecordExistAsync(string courseId);
    Task<IEnumerable<AdminReviewLesson>> GetAdminReviewedLessonsAsync(string adminId, string courseId);
    Task AdminReviewLessonAsync(AdminReviewLesson adminReviewLesson);
}