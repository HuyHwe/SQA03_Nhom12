using project.Models;

public interface ICourseContentRepository
{
    // Task<IEnumerable<CourseContent>> GetContentsByCourseIdAsync(string courseId);
    Task<int> TotalLessons(string courseId);
    Task AddCourseContentAsync(CourseContent content);
    Task UpdateCourseContentAsync(CourseContent content);
    Task<CourseContent?> GetCourseContentByIdAsync(string courseContentId);
    Task<CourseContent?> GetCourseContentByCourseIdAsync(string courseId);
    Task<CourseContent?> GetCourseContentOverviewByCourseIdAsync(string courseId);
    Task<bool> CourseContentExistsAsync(string courseId);
    Task<bool> CourseContentExistsByContentIdAsync(string contentId);
    // Task UpdateCourseContentAsync(CourseContent content);
    // Task DeleteCourseContentAsync(string contentId);
}