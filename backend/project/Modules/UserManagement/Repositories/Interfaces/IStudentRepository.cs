using project.Models;

public interface IStudentRepository
{
    Task<bool> IsStudentExistAsync(string studentId);
    Task<Student?> GetStudentByUserIdAsync(string userId);
}