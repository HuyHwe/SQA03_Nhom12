using System;
using project.Models.Posts;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Services.Implements;

public class ForumQuestionService : IForumQuestionService
{
    private readonly IForumQuestionRepository _repository;

    public ForumQuestionService(IForumQuestionRepository repository)
    {
        _repository = repository;
    }


    public async Task<IEnumerable<ForumQuestionDto>> GetAllQuestionsAsync()
    {
        var questions = await _repository.GetAllAsync();

        return questions.Select(q => new ForumQuestionDto
        {
            Id = q.Id,
            Title = q.Title ?? string.Empty,
            Tags = q.Tags,
            ViewCount = q.ViewCount,
            DiscussionCount = q.DiscussionCount,
            LikeCount = q.LikeCount,
            CreatedAt = q.CreatedAt,
            StudentId = q.StudentId,
            StudentName = q.Student.User?.FullName ?? "Ẩn danh",
            IsDeleted = q.IsDeleted,
            DeletedAt = q.DeletedAt
        });
    }

    public async Task<(List<ForumQuestionDto> Items, int TotalRecords)> GetAllQuestionsPagedAsync(
    int page,
    int pageSize,
    List<string>? tags = null
)
    {
        var (items, totalRecords) = await _repository.GetPagingAsync(page, pageSize, tags);

        var mapped = items.Select(q => new ForumQuestionDto
        {
            Id = q.Id,
            Title = q.Title ?? string.Empty,
            Tags = q.Tags,
            ViewCount = q.ViewCount,
            DiscussionCount = q.DiscussionCount,
            LikeCount = q.LikeCount,
            CreatedAt = q.CreatedAt,
            StudentId = q.StudentId,
            StudentName = q.Student?.User?.FullName ?? "Ẩn danh",
            IsDeleted = q.IsDeleted,
            DeletedAt = q.DeletedAt
        }).ToList();

        return (mapped, totalRecords);
    }





    public async Task<ForumQuestionDetailDto?> GetQuestionByIdAsync(string id)
    {
        var question = await _repository.GetByIdAsync(id);
        if (question == null) throw new Exception("Câu hỏi không tồn tại.");

        return new ForumQuestionDetailDto
        {
            Id = question.Id,
            Title = question.Title ?? string.Empty,
            ContentJson = question.ContentJson,
            Tags = question.Tags,
            ViewCount = question.ViewCount,
            DiscussionCount = question.DiscussionCount,
            LikeCount = question.LikeCount,
            CreatedAt = question.CreatedAt,
            UpdatedAt = question.UpdatedAt,
            StudentId = question.StudentId!,
            StudentName = question.Student?.User?.FullName ?? "Ẩn danh",
            IsDeleted = question.IsDeleted,
            DeletedAt = question.DeletedAt
        };
    }

    public async Task<IEnumerable<ForumQuestionDto>> GetQuestionsByStudentAsync(string studentId)
    {
        var questions = await _repository.GetByStudentPublicAsync(studentId);

        return questions.Select(q => new ForumQuestionDto
        {
            Id = q.Id,
            Title = q.Title ?? string.Empty,
            Tags = q.Tags,
            ViewCount = q.ViewCount,
            DiscussionCount = q.DiscussionCount,
            LikeCount = q.LikeCount,
            CreatedAt = q.CreatedAt,
            StudentId = q.StudentId,
            StudentName = q.Student.User?.FullName ?? "Ẩn danh",
            IsDeleted = q.IsDeleted,
            DeletedAt = q.DeletedAt
        });
    }


    public async Task<string> CreateAsync(string studentId, ForumQuestionCreateDto dto)
    {
        var q = new ForumQuestion
        {
            StudentId = studentId,
            Title = dto.Title,
            ContentJson = dto.ContentJson,
            Tags = dto.Tags
        };

        await _repository.AddAsync(q);
        await _repository.SaveChangesAsync();
        return q.Id;
    }

    public async Task<bool> UpdateAsync(string id, string studentId, ForumQuestionUpdateDto dto)
    {
        var q = await _repository.GetByIdAsync(id);
        if (q == null) return false;

        if (q.StudentId != studentId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa câu hỏi này.");

        q.Title = dto.Title;
        q.ContentJson = dto.ContentJson;
        q.Tags = dto.Tags;
        q.UpdatedAt = DateTime.Now;

        await _repository.UpdateAsync(q);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SoftDeleteAsync(string id, string studentId)
    {
        var q = await _repository.GetByIdAllowDeletedAsync(id);
        if (q == null) return false;

        if (q.StudentId != studentId)
            throw new UnauthorizedAccessException("Bạn không có quyền xoá câu hỏi này.");

        q.IsDeleted = true;
        q.DeletedAt = DateTime.Now;

        await _repository.UpdateAsync(q);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(string id, string studentId)
    {
        var q = await _repository.GetByIdAllowDeletedAsync(id);
        if (q == null) return false;

        if (q.StudentId != studentId)
            throw new UnauthorizedAccessException("Bạn không có quyền khôi phục câu hỏi này.");

        q.IsDeleted = false;
        q.DeletedAt = null;

        await _repository.UpdateAsync(q);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HardDeleteAsync(string id, string? studentId, bool isAdmin = false)
    {
        var q = await _repository.GetByIdAllowDeletedAsync(id);
        if (q == null) return false;

        if (!isAdmin && q.StudentId != studentId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa vĩnh viễn câu hỏi này.");

        _repository.Delete(q);
        await _repository.SaveChangesAsync();
        return true;
    }


    public async Task<IEnumerable<ForumQuestionDto>> GetDeletedQuestionsAsync(string studentId)
    {
        var questions = await _repository.GetDeletedByStudentAsync(studentId);

        return questions.Select(q => new ForumQuestionDto
        {
            Id = q.Id,
            Title = q.Title ?? string.Empty,
            Tags = q.Tags,
            ViewCount = q.ViewCount,
            DiscussionCount = q.DiscussionCount,
            LikeCount = q.LikeCount,
            CreatedAt = q.CreatedAt,
            StudentId = q.StudentId,
            StudentName = q.Student.User?.FullName ?? "Ẩn danh",
            IsDeleted = q.IsDeleted,
            DeletedAt = q.DeletedAt
        });
    }

    public async Task<bool> IncreaseViewCountAsync(string id)
    {
        var question = await _repository.GetByIdAsync(id);
        if (question == null) return false;

        question.ViewCount++;

        await _repository.UpdateAsync(question);
        await _repository.SaveChangesAsync();
        return true;
    }


}
