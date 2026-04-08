using Microsoft.EntityFrameworkCore;

public class SubmissionExamRepository : ISubmissionExamRepository
{
    private readonly DBContext _dbContext;
    public SubmissionExamRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateSubmissionExamAsync(SubmissionExam submissionExam)
    {
        await _dbContext.SubmissionExams.AddAsync(submissionExam);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateSubmissionExamAsync(SubmissionExam submissionExam)
    {
        _dbContext.SubmissionExams.Update(submissionExam);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<int> CountPassExamsAsync(string courseId, string studentId, double passScore)
    {
        var submissions = await _dbContext.SubmissionExams
            .Where(se => se.StudentId == studentId
                    && se.Exam.CourseContent != null
                    && se.Exam.CourseContent.CourseId == courseId)
            .Include(se => se.Exam) // đảm bảo EF load liên kết
            .ToListAsync();

        var passCount = submissions
            .GroupBy(se => se.ExamId)
            .Select(g => g.OrderByDescending(x => x.Score).FirstOrDefault())
            .Count(se => se != null && se.Score >= passScore);

        return passCount;
    }

    public async Task<IEnumerable<SubmissionExam>> GetSubmissionHistoryByStudentAndExamAsync(string studentId, string examId)
    {
        return await _dbContext.SubmissionExams
            .Where(se => se.StudentId == studentId && se.ExamId == examId)
            .ToListAsync();
    }

    public async Task<SubmissionExam?> GetSubmissionExamByExamAttemptIdAsync(string examAttemptId)
    {
        return await _dbContext.SubmissionExams
            .FirstOrDefaultAsync(se => se.ExamAttemptId == examAttemptId);
    }

    public async Task<SubmissionExam?> GetSubmissionExamByIdAsync(string submissionExamId)
    {
        return await _dbContext.SubmissionExams
            .FirstOrDefaultAsync(se => se.Id == submissionExamId);
    }
}