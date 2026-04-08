using Microsoft.EntityFrameworkCore;

public class ExamAttempRepository : IExamAttempRepository
{
    private readonly DBContext _context;

    public ExamAttempRepository(DBContext context)
    {
        _context = context;
    }

    public async Task<ExamAttemp?> GetExamAttempByIdAsync(string attemptId)
    {
        return await _context.ExamAttemps.FirstOrDefaultAsync(ea => ea.Id == attemptId);
    }

    public async Task AddExamAttempAsync(ExamAttemp examAttemp)
    {
        await _context.ExamAttemps.AddAsync(examAttemp);
        await _context.SaveChangesAsync();
    }

    public async Task<ExamAttemp?> GetActiveAttemptAsync(string studentId, string examId, DateTime currentTime)
    {
        return await _context.ExamAttemps.FirstOrDefaultAsync(ea =>
            ea.StudentId == studentId &&
            ea.ExamId == examId &&
            ea.IsSubmitted == false &&
            ea.StartTime <= currentTime &&
            ea.EndTime >= currentTime);
    }

    public async Task<bool> SaveExamAttempAsync(ExamAttemp examAttemp)
    {
        _context.ExamAttemps.Update(examAttemp);
        await _context.SaveChangesAsync();
        return true;
    }
}