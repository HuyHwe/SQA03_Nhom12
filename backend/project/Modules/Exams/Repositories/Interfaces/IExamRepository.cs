public interface IExamRepository
{
    Task<(bool Exists, bool IsOpened)> GetExamStatusAsync(string examId);
    Task<int> TotalExamsInCourseAsync(string courseId);
    Task<IEnumerable<Exam>> GetAllExamsAsync();
    Task<IEnumerable<Exam>> GetExamsInCourseAsync(string courseId);
    Task<IEnumerable<Exam>> GetExamsInLessonAsync(string lessonId);
    Task<Exam?> GetExamByIdAsync(string id);
    Task AddExamAsync(Exam exam);
    Task UpdateExamAsync(Exam exam);
    // Task DeleteExamAsync(int id);
    Task UpdateOrderQuestionInExamAsync(string examId, List<QuestionExam> questionExams);
    Task<(IEnumerable<Exam>, int)> GetExamsByCourseIdAsync(string teacherId, string courseId, string? keyword, string? status, string? sort, int page, int pageSize);
}