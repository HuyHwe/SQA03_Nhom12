public interface ILessonService
{
    Task<LessonInformationDTO> GetLessonByIdAsync(string studentId, string courseContentId, string id);
    Task<IEnumerable<LessonCardDTO>> GetLessonsByCourseContentIdAsync(string courseContentId);
    Task AddLessonAsync(string userId, string courseContentId, LessonCreateDTO lessonDto);
    Task UpdateLessonAsync(string userId, string courseContentId, string id, LessonUpdateDTO lessonDto);
    Task UpdateOrderLessonsAsync(string userId, string courseContentId, List<LessonOrderDTO> lessonOrders);
}