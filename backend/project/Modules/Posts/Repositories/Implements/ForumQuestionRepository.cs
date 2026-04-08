using System;
using Microsoft.EntityFrameworkCore;
using project.Models.Posts;
using project.Modules.Posts.Repositories.Interfaces;

namespace project.Modules.Posts.Repositories.Implements;

public class ForumQuestionRepository : IForumQuestionRepository
{
    private readonly DBContext _context;

    public ForumQuestionRepository(DBContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ForumQuestion>> GetAllAsync()
    {
        return await _context.ForumQuestions
        .Where(q => !q.IsDeleted)
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<(List<ForumQuestion> Items, int TotalRecords)> GetPagingAsync(int page, int pageSize)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;

        var query = _context.ForumQuestions
            .Where(q => !q.IsDeleted)
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(q => q.CreatedAt)
            .AsQueryable();

        int totalRecords = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<(List<ForumQuestion> Items, int TotalRecords)> GetPagingAsync(
    int page,
    int pageSize,
    List<string>? tags = null
)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;

        var query = _context.ForumQuestions
            .Where(q => !q.IsDeleted)
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .AsQueryable();

        // 🔍 Filter theo tags (varchar)
        if (tags != null && tags.Any())
        {
            foreach (var tag in tags)
            {
                string t = tag.Trim().ToLower();
                query = query.Where(q =>
                    q.Tags != null &&
                    q.Tags.ToLower().Contains(t)   // MATCH 1 trong các tag
                );
            }
        }

        int totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }


    public async Task<ForumQuestion?> GetByIdAsync(string id)
    {
        return await _context.ForumQuestions
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted);
    }



    public async Task<IEnumerable<ForumQuestion>> GetByStudentPublicAsync(string studentId)
    {
        return await _context.ForumQuestions
            .Where(q => q.StudentId == studentId && !q.IsDeleted) // chỉ lấy bài không bị xóa
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }
    // Nếu muốn lấy cả câu hỏi đã bị xóa (để xử lý Delete/Restore)
    public async Task<ForumQuestion?> GetByIdAllowDeletedAsync(string id)
    {
        return await _context.ForumQuestions
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<IEnumerable<ForumQuestion>> GetDeletedByStudentAsync(string studentId)
    {
        return await _context.ForumQuestions
            .Where(q => q.IsDeleted && q.StudentId == studentId)
            .Include(q => q.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(q => q.DeletedAt)
            .ToListAsync();
    }

    public async Task AddAsync(ForumQuestion question) =>
       await _context.ForumQuestions.AddAsync(question);

    public async Task UpdateAsync(ForumQuestion question) =>
        _context.ForumQuestions.Update(question);

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();

    public void Delete(ForumQuestion question) =>
           _context.ForumQuestions.Remove(question);


    public async Task<bool> IncreaseViewCountAsync(string id)
    {
        var affected = await _context.ForumQuestions
            .Where(q => q.Id == id && !q.IsDeleted)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(q => q.ViewCount, q => q.ViewCount + 1)
            );

        return affected > 0;
    }



}
