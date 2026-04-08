public interface ILessonProgressRepository
{
    Task<bool> ExistsAsync(string lessonId, string studentId);
    Task AddNewLessonProgressAsync(LessonProgress lessonProgress);
    Task<int> CountCompletedLessonsAsync(string courseId, string studentId);
}