public interface ITeacherService
{
    Task<TeacherOverview> GetTeacherOverviewAsync(string teacherId);
}