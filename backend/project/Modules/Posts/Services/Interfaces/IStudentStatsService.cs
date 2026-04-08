using System;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface IStudentStatsService
{
   Task<List<StudentStatsDto>> GetStatsAsync(int? month);
   Task<bool> IsTeacherAsync(string studentId);
   Task<int[]?> GetStudentScoresAsync(string studentId);
}
