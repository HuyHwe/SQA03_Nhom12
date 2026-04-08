public interface IExamService
{
    Task<IEnumerable<InformationExamDTO>> GetAllExamsAsync();
    Task<IEnumerable<InformationExamDTO>> GetExamsInCourseAsync(string courseId);
    Task<IEnumerable<InformationExamDTO>> GetExamsInLessonAsync(string studentId, string lessonId);
    Task<InformationExamDTO?> GetExamByIdAsync(string userId, string id);
    Task AddExamAsync(string userId, CreateExamDTO exam);
    Task UpdateExamAsync(string userId, string examId, UpdateExamDTO examUpdate);
    // Task DeleteExamAsync(int id);
    Task UpdateOrderQuestionInExamAsync(string userId, string examId, List<QuestionExamOrderDTO> questionOrders);
    Task UploadExamExcelAsync(string userId, UploadExamExcelRequest request);
    Task AddFullExamAsync(string userId, CreateFullExamDTO fullExamDto);
    Task<PageResultExamTeacherDTO> GetExamsByCourseIdAsync(string teacherId, string courseId, string? keyword, string? status, string? sort, int page, int pageSize);
}