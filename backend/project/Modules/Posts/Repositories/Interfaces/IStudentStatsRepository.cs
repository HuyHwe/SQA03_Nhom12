using System;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Repositories.Interfaces;

public interface IStudentStatsRepository
{
    Task<List<StudentStatsDto>> GetStudentStatsAsync(int? month);
    Task<bool> IsTeacherAsync(string studentId);
    Task<int[]?> GetStudentScoresAsync(string studentId);
}  
