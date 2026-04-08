public class SubmissionAnswerRepository : ISubmissionAnswerRepository
{
    private readonly DBContext _dbContext;
    public SubmissionAnswerRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateSubmissionAnswerAsync(SubmissionAnswer submissionAnswer)
    {
        await _dbContext.SubmissionAnswers.AddAsync(submissionAnswer);
        await _dbContext.SaveChangesAsync();
    }
}