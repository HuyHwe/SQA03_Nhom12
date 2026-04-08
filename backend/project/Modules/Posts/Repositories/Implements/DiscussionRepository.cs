using System;
using Microsoft.EntityFrameworkCore;
using project.Models;
using project.Models.Posts;
using project.Modules.Posts.Repositories.Interfaces;

namespace project.Modules.Posts.Repositories;

public class DiscussionRepository : IDiscussionRepository
{
    private readonly DBContext _context;

    public DiscussionRepository(DBContext context)
    {
        _context = context;
    }

    //  Lấy tất cả comment trong hệ thống
    public async Task<IEnumerable<Discussion>> GetAllCommentsAsync()
    {
        return await _context.Discussions
            .Include(d => d.Student)
                .ThenInclude(s => s.User)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    // Hàm dùng chung cho mọi TargetType
    public async Task<IEnumerable<Discussion>> GetCommentsByTargetAsync(string targetType, string targetId)
    {
        return await _context.Discussions
            .Include(d => d.Student)
                .ThenInclude(s => s.User)
            .Where(d => d.TargetType == targetType && d.TargetTypeId == targetId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }
    public async Task<Discussion?> GetByIdAsync(string id)
    {
        return await _context.Discussions
            .Include(d => d.Student)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Discussion> CreateAsync(Discussion discussion)
    {
        _context.Discussions.Add(discussion);
        await _context.SaveChangesAsync();
        return discussion;
    }

    public async Task<Discussion> UpdateAsync(Discussion discussion)
    {
        _context.Discussions.Update(discussion);
        await _context.SaveChangesAsync();
        return discussion;
    }

    public async Task DeleteAsync(Discussion discussion)
    {
        _context.Discussions.Remove(discussion);
        await _context.SaveChangesAsync();
    }

    
    public async Task<bool> IsValidTargetAsync(string targetType, string targetTypeId)
    {
        return targetType switch
        {
            "Course" => await _context.Courses.AnyAsync(c => c.Id == targetTypeId),
            "Post" => await _context.Posts.AnyAsync(p => p.Id == targetTypeId),
            "ForumQuestion" => await _context.ForumQuestions.AnyAsync(f => f.Id == targetTypeId),
            _ => false
        };
    }



}
