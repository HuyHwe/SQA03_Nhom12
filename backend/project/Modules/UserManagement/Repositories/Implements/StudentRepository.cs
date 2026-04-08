using Microsoft.EntityFrameworkCore;
using project.Models;

public class StudentRepository : IStudentRepository
{
    private readonly DBContext _dbContext;
    public StudentRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> IsStudentExistAsync(string studentId)
    {
        return await _dbContext.Students.AnyAsync(s => s.StudentId == studentId);
    }

    public async Task<Student?> GetStudentByUserIdAsync(string userId)
    {
        var student = await _dbContext.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);
        return student;
    }
}