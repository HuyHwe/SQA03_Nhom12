using System;
using Microsoft.EntityFrameworkCore;
using project.Models.Posts;

namespace project.Modules.Posts.Repositories.Interfaces;

public class PostRepository : IPostRepository
{
    private readonly DBContext _context;

    public PostRepository(DBContext context)
    {
        _context = context;
    }

    // ✅ Lấy tất cả bài viết
    public async Task<IEnumerable<Post>> GetAllPostsAsync()
    {
        return await _context.Posts
            .Where(p => !p.IsDeleted && p.IsPublished) // Lọc bài chưa bị xóa
            .Include(p => p.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<(List<Post> Items, int TotalRecords)> GetPagingAsync(
    int page,
    int pageSize,
    List<string>? tags
)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;

        var query = _context.Posts
            .Where(p => !p.IsDeleted && p.IsPublished)
            .Include(p => p.Student)
                .ThenInclude(s => s.User)
            .AsQueryable();

        // 🔍 Lọc theo tags nếu có
        if (tags != null && tags.Any())
        {
            var normalizedTags = tags
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .ToList();

            query = query.Where(p =>
                p.Tags != null &&
                normalizedTags.Any(tag => p.Tags.Contains(tag))
            );
        }

        int totalRecords = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }



    // Lấy bài viết của 1 thành viên ( bài công khai )

    public async Task<IEnumerable<Post>> GetPostsByMemberIdAsync(string memberId)
    {
        return await _context.Posts
            .Where(p => p.AuthorId == memberId && !p.IsDeleted && p.IsPublished)
            .Include(p => p.Student)
            .ThenInclude(s => s.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }


    // Lấy chi tiết bài viết, bài viết chưa xóa và công khai

    public async Task<Post?> GetPostByIdAsync(string id)
    {
        return await _context.Posts
            .Where(p => !p.IsDeleted && p.IsPublished)
            .Include(p => p.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }


    // Lấy chi tiết bài viết bao gồm cả đã xóa và chưa công khai

    public async Task<Post?> GetAllPostByIdAsync(string id)
    {
        return await _context.Posts
            .Include(p => p.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }


    public async Task<IEnumerable<Post>> GetPostsByAuthorDeletedAsync(string authorId)
    {
        return await _context.Posts
            .Where(p => p.AuthorId == authorId && p.IsDeleted) // chỉ lấy post đã xóa mềm
            .ToListAsync();
    }





    public async Task<IEnumerable<Post>> SearchPostsByTagAsync(string tag)
    {
        return await _context.Posts
            .Include(p => p.Student)
                .ThenInclude(s => s.User)
            .Where(p => !p.IsDeleted && p.Tags != null && p.Tags.Contains(tag))
            .ToListAsync();
    }

    public async Task<Post> AddPostAsync(Post post)
    {
        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();
        return post;
    }

    public async Task UpdateAsync(Post post)
    {
        _context.Posts.Update(post);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Post post)
    {
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IncreaseViewCountAsync(string id)
    {
        var affected = await _context.Posts
            .Where(p => p.Id == id && !p.IsDeleted && p.IsPublished)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.ViewCount, p => p.ViewCount + 1)
            );

        return affected > 0;
    }

}
