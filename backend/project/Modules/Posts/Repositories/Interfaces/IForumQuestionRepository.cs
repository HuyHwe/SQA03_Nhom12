using System;
using project.Models.Posts;

namespace project.Modules.Posts.Repositories.Interfaces;

public interface IForumQuestionRepository
{

    // Lấy tất cả các câu thảo luận
    Task<IEnumerable<ForumQuestion>> GetAllAsync();

    Task<(List<ForumQuestion> Items, int TotalRecords)> GetPagingAsync(
    int page,
    int pageSize,
    List<string>? tags = null
);

    // Lấy tất cả các câu thảo luận của 1 người
    Task<IEnumerable<ForumQuestion>> GetByStudentPublicAsync(string studentId);



    // Lấy chi tiết câu thảo luận
    Task<ForumQuestion?> GetByIdAsync(string id);
    // Lấy chi tiết câu thảo luận bao gồm cả đã xóa
    Task<ForumQuestion?> GetByIdAllowDeletedAsync(string id);
    Task AddAsync(ForumQuestion question);
    Task UpdateAsync(ForumQuestion question);
    Task SaveChangesAsync();
    void Delete(ForumQuestion question);

    // Lấy danh sách forum question đã xóa của 1 người 

    Task<IEnumerable<ForumQuestion>> GetDeletedByStudentAsync(string studentId);

    Task<bool> IncreaseViewCountAsync(string id);

}
