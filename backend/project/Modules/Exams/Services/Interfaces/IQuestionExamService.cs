public interface IQuestionExamService
{
    Task<bool> ExistQuestionAsync(string questionId);
    Task AddQuestionToExamAsync(string userId, string examId, CreateQuestionExamDTO questionExam);
    Task DeleteQuestionExamAsync(string userId, string examId, string questionExamId);
    // Task RemoveQuestionFromExamAsync(int questionId, string examId);
    // Task UpdateQuestionInExamAsync(QuestionExam questionExam);
    // Task<IEnumerable<QuestionExam>> GetQuestionsByExamIdAsync(string examId);
    Task<IEnumerable<QuestionExamForDoingExamDTO>> GetQuestionsByExamIdForDoingExamAsync(string studentId, string examId);
    Task<IEnumerable<QuestionExamForReviewSubmissionDTO>> GetQuestionsByExamIdForReviewSubmissionAsync(string studentId, string examId);
    Task<IEnumerable<QuestionExamOrderDTO>> GetQuestionExamOrderAsync(string examId);
    Task<QuestionExamForDoingExamDTO?> GetQuestionInExamForDoingExamAsync(string questionId);
    Task<QuestionExamForReviewSubmissionDTO?> GetQuestionInExamForReviewSubmissionAsync(string questionId);
}