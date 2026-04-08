
using Microsoft.EntityFrameworkCore;

public class QuestionExamRepository : IQuestionExamRepository
{
    private readonly DBContext _dbContext;
    public QuestionExamRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task AddQuestionToExamAsync(QuestionExam questionExam)
    {
        await _dbContext.QuestionExams.AddAsync(questionExam);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> ExistQuestionAsync(string questionId)
    {
        return await _dbContext.QuestionExams
            .AnyAsync(qe => qe.Id == questionId);
    }

    public async Task<int> CountQuestionsInExamAsync(string examId)
    {
        return await _dbContext.QuestionExams
            .CountAsync(qe => qe.ExamId == examId);
    }

    public async Task<IEnumerable<QuestionExam>> GetQuestionsByExamIdAsync(string examId)
    {
        return await _dbContext.QuestionExams
            .Where(qe => qe.ExamId == examId)
            .ToListAsync();
    }

    public async Task<QuestionExam?> GetQuestionInExamAsync(string questionId)
    {
        return await _dbContext.QuestionExams
            .FirstOrDefaultAsync(qe => qe.Id == questionId);
    }

    public Task RemoveQuestionFromExamAsync(string questionId, string examId)
    {
        throw new NotImplementedException();
    }

    public void DeleteQuestionExam(QuestionExam questionExam)
    {
        _dbContext.QuestionExams.Remove(questionExam);
    }

    public Task UpdateQuestionInExamAsync(QuestionExam questionExam)
    {
        throw new NotImplementedException();
    }

    public async Task UploadBulkQuestionsAsync(IEnumerable<QuestionExam> questionExams)
    {
        if (questionExams == null || !questionExams.Any())
        {
            throw new ArgumentException("No questions provided.");
        }

        await _dbContext.QuestionExams.AddRangeAsync(questionExams);

        var allChoices = questionExams.SelectMany(q => q.Choices);
        if (!allChoices.Any())
        {
            throw new InvalidOperationException("No choices found for the provided questions.");
        }

        await _dbContext.Choices.AddRangeAsync(allChoices);
        await _dbContext.SaveChangesAsync();
    }
}