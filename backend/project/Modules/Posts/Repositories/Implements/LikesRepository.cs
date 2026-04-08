using System;
using Microsoft.EntityFrameworkCore;
using project.Models.Posts;
using project.Modules.Posts.Repositories.Interfaces;

namespace project.Modules.Posts.Repositories.Implements;

public class LikesRepository : ILikesRepository
{
    private readonly DBContext _context;

    public LikesRepository(DBContext context)
    {
        _context = context;
    }

       public async Task<Likes?> GetLikeAsync(string studentId, string targetType, string targetId)
    {
        return await _context.Likes
            .Include(l => l.Student)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(l => l.StudentId == studentId 
                                      && l.TargetType == targetType 
                                      && l.TargetId == targetId);
    }


    public async Task<IEnumerable<Likes>> GetAllLikesAsync()
    {
        return await _context.Likes
            .Include(l => l.Student)
            .ThenInclude(s => s.User)
            .ToListAsync();
    }


    public async Task<IEnumerable<Likes>> GetLikesByTargetAsync(string targetType, string targetId)
    {
        return await _context.Likes
            .Include(l => l.Student)
            .ThenInclude(s => s.User)
            .Where(l => l.TargetType == targetType && l.TargetId == targetId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Likes>> GetLikesByStudentAsync(string studentId)
    {
        return await _context.Likes
            .Include(l => l.Student)
            .ThenInclude(s => s.User)
            .Where(l => l.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<Likes?> GetLikesAsync(string studentId, string targetType, string targetId)
    {
        return await _context.Likes
            .Include(l => l.Student)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(l => l.StudentId == studentId
                                      && l.TargetType == targetType
                                      && l.TargetId == targetId);
    }

    public async Task AddAsync(Likes like)
    {
        await _context.Likes.AddAsync(like);
    }

    public void Delete(Likes like)
    {
        _context.Likes.Remove(like);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsTargetAsync(string targetType, string targetId)
    {
        return targetType switch
        {
            "Post" => await _context.Posts.AnyAsync(p => p.Id == targetId),
            "ForumQuestion" => await _context.ForumQuestions.AnyAsync(f => f.Id == targetId),
            "Course" => await _context.Courses.AnyAsync(c => c.Id == targetId),
            "Discussion" => await _context.Discussions.AnyAsync(d => d.Id == targetId),
            _ => false
        };
    }

    public async Task<int> CountLikesAsync(string targetType, string targetId)
    {
        return await _context.Likes.CountAsync(l => l.TargetType == targetType && l.TargetId == targetId);
    }

    public async Task LoadStudentUserAsync(Likes like)
    {
        await _context.Entry(like)
            .Reference(l => l.Student)
            .Query()
            .Include(s => s.User)
            .LoadAsync();
    }


}
