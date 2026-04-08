using project.Models;

public interface ICourseRepository
{
    Task<bool> CourseExistsAsync(string id);
    Task<Course?> GetCourseByIdAsync(string id);
    Task<Course?> GetCourseByStatusAsync(string id, string status);
    Task<IEnumerable<Course>> GetAllCoursesAsync();
    Task<(IEnumerable<Course>, int)> SearchItemsAsync(string? keyword, string? category, int page, int pageSize);
    // Task<IEnumerable<Course>> GetCoursesByCategoryAsync(string categoryId);
    Task<(IEnumerable<Course>, int)> GetCoursesByTeacherIdAsync(string teacherId, string? keyword, string? status, string? sort, int page, int pageSize);
    Task<(IEnumerable<Enrollment_course>, int)> GetEnrolledCoursesByStudentIdAsync(string studentId, string? keyword, string? status, string? sort, int page, int pageSize);
    Task AddCourseAsync(Course course);
    Task UpdateCourseAsync(Course course);
    // Task DeleteCourseAsync(string id);
    Task<Course?> GetCourseByIdByTeacherAsync(string courseId, string teacherId);
    Task<bool> UpdateCourseStatusAsync(string courseId, string status);
    Task<IEnumerable<Course>> GetTopCoursesByTeacherAsync(string teacherId, int count);
}