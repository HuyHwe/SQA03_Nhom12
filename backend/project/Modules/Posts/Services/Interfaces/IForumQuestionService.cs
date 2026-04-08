using System;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface IForumQuestionService
{
    Task<IEnumerable<ForumQuestionDto>> GetAllQuestionsAsync();
    Task<(List<ForumQuestionDto> Items, int TotalRecords)> GetAllQuestionsPagedAsync(
    int page,
    int pageSize,
    List<string>? tags = null
);
    Task<ForumQuestionDetailDto?> GetQuestionByIdAsync(string id);
    Task<IEnumerable<ForumQuestionDto>> GetQuestionsByStudentAsync(string studentId);
    Task<string> CreateAsync(string studentId, ForumQuestionCreateDto dto);
    Task<bool> UpdateAsync(string id, string studentId, ForumQuestionUpdateDto dto);
    Task<bool> SoftDeleteAsync(string id, string studentId);
    Task<bool> RestoreAsync(string id, string studentId);
    Task<bool> HardDeleteAsync(string id, string? studentId, bool isAdmin = false);
    Task<IEnumerable<ForumQuestionDto>> GetDeletedQuestionsAsync(string studentId);
    Task<bool> IncreaseViewCountAsync(string id);
}
