public interface ITeacherRepository
{
    Task<bool> IsTeacherExistsAsync(string teacherId);
    Task<InstructorStatisticDTO> GetInstructorStatisticsAsync(string teacherId);
}