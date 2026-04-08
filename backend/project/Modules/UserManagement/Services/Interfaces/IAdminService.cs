using Microsoft.AspNetCore.Mvc;
using project.Models;
using project.Modules.UserManagement.DTOs;

public interface IAdminService
{
    // Admin methods for managing courses
    Task<PageResultCoursesDTO> GetCoursesByAdminAsync(string userId, string? status, int page, int pageSize);
    Task<FullCourseDTO> GetFullCourseByIdAsync(string userId, string courseId);
    Task AdminApproveCourseAsync(string userId, string courseId);
    Task AdminRejectCourseAsync(string userId, string courseId, [FromBody] string RejectReason);

    // Admin methods for managing enrollment
    Task<IEnumerable<RefundRequestCourseDTO>> GetPendingRefundRequestsAsync();
    Task AdminReviewCourseAsync(string userId, string courseId);
    Task<Lesson?> AdminReviewLessonAsync(string userId, string courseId, string lessonId);
}