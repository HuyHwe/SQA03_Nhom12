using System;
using Microsoft.EntityFrameworkCore;
using project.Models.Posts;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Services.Implements;

public class LikesService : ILikesService
{
    private readonly ILikesRepository _repository;
    private readonly DBContext _context;

    public LikesService(ILikesRepository repository, DBContext context)
    {
        _repository = repository;
        _context = context;
    }

    private static LikeDto MapToDto(Likes l)
    {
        return new LikeDto
        {
            Id = l.Id,
            StudentId = l.StudentId,
            StudentName = l.Student.User.FullName,
            AvatarUrl = l.Student.User.AvatarUrl,
            TargetType = l.TargetType!,
            TargetId = l.TargetId!,
            CreatedAt = l.CreatedAt
        };
    }

    public async Task<IEnumerable<LikeDto>> GetLikesByTargetAsync(string targetType, string targetId)
    {
        var likes = await _repository.GetLikesByTargetAsync(targetType, targetId);
        return likes.Select(MapToDto);
    }

    public async Task<IEnumerable<LikeDto>> GetAllLikesAsync()
    {
        var likes = await _repository.GetAllLikesAsync();
        return likes.Select(l => new LikeDto
        {
            Id = l.Id,
            StudentId = l.StudentId,
            StudentName = l.Student.User.FullName,
            AvatarUrl = l.Student.User.AvatarUrl,
            TargetType = l.TargetType!,
            TargetId = l.TargetId!,
            CreatedAt = l.CreatedAt
        });
    }


    public async Task<IEnumerable<LikeDto>> GetLikesByStudentAsync(string studentId)
    {
        var likes = await _repository.GetLikesByStudentAsync(studentId);
        return likes.Select(l => new LikeDto
        {
            Id = l.Id,
            StudentId = l.StudentId,
            StudentName = l.Student.User.FullName,
            AvatarUrl = l.Student.User.AvatarUrl,
            TargetType = l.TargetType!,
            TargetId = l.TargetId!,
            CreatedAt = l.CreatedAt
        });
    }

    public async Task<LikeDto> ToggleLikeAsync(string studentId, string targetType, string targetId)
{
    if (!await _repository.ExistsTargetAsync(targetType, targetId))
        throw new ArgumentException($"Target '{targetType}' với Id '{targetId}' không tồn tại");

    var existing = await _repository.GetLikeAsync(studentId, targetType, targetId);

    bool liked;
    Likes likeEntity;

    if (existing != null)
    {
        // Bỏ like
        _repository.Delete(existing);
        await _repository.SaveChangesAsync();
        await UpdateLikeCountAsync(targetType, targetId);
        liked = false;
        likeEntity = existing;
    }
    else
    {
        // Thêm like
        var like = new Likes
        {
            StudentId = studentId,
            TargetType = targetType,
            TargetId = targetId,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(like);
        await _repository.SaveChangesAsync();
        await _repository.LoadStudentUserAsync(like);
        await UpdateLikeCountAsync(targetType, targetId);
        liked = true;
        likeEntity = like;
    }

    // Tính tổng LikeCount
    int likeCount = await _repository.CountLikesAsync(targetType, targetId);

    // Map DTO
    return new LikeDto
    {
        Id = likeEntity.Id,
        StudentId = likeEntity.StudentId,
        StudentName = likeEntity.Student.User.FullName,
        AvatarUrl = likeEntity.Student.User.AvatarUrl,
        TargetType = likeEntity.TargetType,
        TargetId = likeEntity.TargetId,
        CreatedAt = likeEntity.CreatedAt,
        Liked = liked,
        LikeCount = likeCount
    };
}



    public async Task UpdateLikeCountAsync(string targetType, string targetId)
    {
        // Chỉ cập nhật những bảng có LikeCount
        int count = await _repository.CountLikesAsync(targetType, targetId);

        switch (targetType)
        {
            case "Post":
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == targetId);
                if (post != null)
                {
                    post.LikeCount = count;
                    _context.Posts.Update(post);
                }
                break;

            case "ForumQuestion":
                var question = await _context.ForumQuestions.FirstOrDefaultAsync(f => f.Id == targetId);
                if (question != null)
                {
                    question.LikeCount = count;
                    _context.ForumQuestions.Update(question);
                }
                break;

                // Course & Discussion không có LikeCount => không cập nhật
        }

        await _context.SaveChangesAsync();
    }



}
