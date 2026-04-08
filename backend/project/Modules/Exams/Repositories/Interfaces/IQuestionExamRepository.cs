public interface IQuestionExamRepository
{
    Task<bool> ExistQuestionAsync(string questionId);
    Task<int> CountQuestionsInExamAsync(string examId);
    Task AddQuestionToExamAsync(QuestionExam questionExam);
    Task RemoveQuestionFromExamAsync(string questionId, string examId);
    Task UpdateQuestionInExamAsync(QuestionExam questionExam);
    void DeleteQuestionExam(QuestionExam questionExam);
    Task<IEnumerable<QuestionExam>> GetQuestionsByExamIdAsync(string examId);
    Task<QuestionExam?> GetQuestionInExamAsync(string questionId);
    Task UploadBulkQuestionsAsync(IEnumerable<QuestionExam> questionExams);
}