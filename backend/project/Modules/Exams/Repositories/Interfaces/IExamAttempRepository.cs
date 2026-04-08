public interface IExamAttempRepository
{
    Task<ExamAttemp?> GetExamAttempByIdAsync(string attemptId);
    Task AddExamAttempAsync(ExamAttemp examAttemp);
    // Task UpdateExamAttempAsync(ExamAttemp examAttemp);
    Task<ExamAttemp?> GetActiveAttemptAsync(string studentId, string examId, DateTime currentTime);
    Task<bool> SaveExamAttempAsync(ExamAttemp examAttemp);
}