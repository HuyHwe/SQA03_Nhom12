using Microsoft.EntityFrameworkCore;
using project.Models;

public class ExamRepository : IExamRepository
{
    private readonly DBContext _dbContext;
    public ExamRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(bool Exists, bool IsOpened)> GetExamStatusAsync(string examId)
    {
        var exam = await _dbContext.Exams
            .Where(e => e.Id == examId)
            .Select(e => new { e.Id, e.IsOpened })
            .FirstOrDefaultAsync();

        if (exam == null)
        {
            return (false, false);
        }
        return (true, exam.IsOpened);
    }

    public async Task<int> TotalExamsInCourseAsync(string courseId)
    {
        return await _dbContext.Exams
            .Where(e => e.CourseContent != null && e.CourseContent.CourseId == courseId)
            .CountAsync();
    }

    public async Task<IEnumerable<Exam>> GetAllExamsAsync()
    {
        return await _dbContext.Exams.ToListAsync();
    }

    public async Task<(IEnumerable<Exam>, int)> GetExamsByCourseIdAsync(string teacherId, string courseId, string? keyword, string? status, string? sort, int page, int pageSize)
    {
        var query = _dbContext.Exams
            .Include(e => e.CourseContent)
                .ThenInclude(cc => cc.Course)
            .Include(e => e.Lesson)
                .ThenInclude(e => e.CourseContent)
                    .ThenInclude(cc => cc.Course)
            .Where(e => (e.CourseContent != null && e.CourseContent.CourseId == courseId) ||
                        (e.Lesson != null && e.Lesson.CourseContent.CourseId == courseId))
            .Where(e => (e.CourseContent != null && e.CourseContent.Course.TeacherId == teacherId) ||
                        (e.Lesson != null && e.Lesson.CourseContent.Course.TeacherId == teacherId))
            .AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(e => e.Title.Contains(keyword));
        }
        if (!string.IsNullOrEmpty(status))
        {
            if (status == "opened")
            {
                query = query.Where(e => e.IsOpened);
            }
            else if (status == "closed")
            {
                query = query.Where(e => !e.IsOpened);
            }
        }

        if (!string.IsNullOrEmpty(sort))
        {
            query = sort switch
            {
                "alphabet-desc" => query.OrderByDescending(e => e.Title),
                "alphabet-asc" => query.OrderBy(e => e.Title),
                "time-duration-desc" => query.OrderByDescending(e => e.DurationMinutes),
                "time-duration-asc" => query.OrderBy(e => e.DurationMinutes),
                "total-completed-desc" => query.OrderByDescending(e => e.TotalCompleted),
                "total-completed-asc" => query.OrderBy(e => e.TotalCompleted),
                _ => query.OrderByDescending(e => e.Title)
            };
        }
        else
        {
            query = query.OrderByDescending(e => e.Title);
        }

        var totalItems = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalItems);
    }

    public async Task<IEnumerable<Exam>> GetExamsInCourseAsync(string courseId)
    {
        return await _dbContext.Exams
            .Include(e => e.CourseContent)
            .Where(e => e.CourseContent != null && e.CourseContent.CourseId == courseId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Exam>> GetExamsInLessonAsync(string lessonId)
    {
        return await _dbContext.Exams
            .Where(e => e.LessonId == lessonId)
            .ToListAsync();
    }

    public async Task<Exam?> GetExamByIdAsync(string id)
    {
        return await _dbContext.Exams.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task AddExamAsync(Exam exam)
    {
        await _dbContext.Exams.AddAsync(exam);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateExamAsync(Exam exam)
    {
        _dbContext.Exams.Update(exam);
        await _dbContext.SaveChangesAsync();
    }

    // public async Task DeleteExamAsync(string id)
    // {

    // }

    public async Task UpdateOrderQuestionInExamAsync(string examId, List<QuestionExam> questionExams)
    {
        var existingQuestions = await _dbContext.QuestionExams
            .Where(q => q.ExamId == examId)
            .ToListAsync();

        var questionMap = questionExams.ToDictionary(q => q.Id, q => q.Order);

        foreach (var question in existingQuestions)
        {
            if (questionMap.TryGetValue(question.Id, out var newOrder))
            {
                question.Order = newOrder;
            }
        }

        await _dbContext.SaveChangesAsync();
    }
}