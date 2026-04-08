using Microsoft.AspNetCore.Mvc;

public interface IEnrollmentCourseService
{
    Task<bool> IsEnrolledInCourseAsync(string studentId, string courseId);
    Task<IEnumerable<EnrollmentInforDTO>> GetEnrollmentInCourseAsync(string userId, string courseId);
    Task<EnrollmentInforDTO> GetEnrollmentByIdAsync(string userId, string courseId, string enrollmentId);
    Task CreateEnrollmentAsync(string courseId, string studentId);
    Task UpdateProgressEnrollmentAsync(string studentId, string courseId, EnrollmentProgressUpdateDTO enrollmentProgressUpdateDTO);
    Task RequestCancelEnrollmentAsync(string userId, string courseId, string enrollmentId, RequestCancelEnrollmentDTO dto);
    Task<RecentEnrollmentOfTeacherDTO> GetRecentEnrollmentsOfTeacherAsync(string teacherId, int count);
}