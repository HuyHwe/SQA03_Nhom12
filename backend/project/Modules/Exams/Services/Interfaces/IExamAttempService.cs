public interface IExamAttempService
{
    Task<ExamAttempDTO?> AddExamAttempAsync(string studentId, string examId);
    Task<ExamAttempDTO?> GetExamAttempByIdAsync(string studentId, string attemptId);
    // Task<bool> CheckValidExamAttempAsync(string attemptId);
    Task SaveExamAnswersAsync(string studentId, string attemptId, string answers);
}