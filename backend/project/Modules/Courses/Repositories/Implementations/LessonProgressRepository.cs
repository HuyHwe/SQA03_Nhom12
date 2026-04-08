using Microsoft.EntityFrameworkCore;

public class LessonProgressRepository : ILessonProgressRepository
{
    private readonly DBContext _dbContext;
    public LessonProgressRepository(DBContext context)
    {
        _dbContext = context;
    }

    public async Task<bool> ExistsAsync(string lessonId, string studentId)
    {
        return await _dbContext.LessonProgresses
            .AnyAsync(lp => lp.LessonId == lessonId && lp.StudentId == studentId);
    }

    public async Task AddNewLessonProgressAsync(LessonProgress lessonProgress)
    {
        await _dbContext.LessonProgresses.AddAsync(lessonProgress);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<int> CountCompletedLessonsAsync(string courseId, string studentId)
    {
        return await _dbContext.LessonProgresses
            .Where(lp => lp.StudentId == studentId && lp.Lesson.CourseContent.CourseId == courseId)
            .CountAsync();
    }
}