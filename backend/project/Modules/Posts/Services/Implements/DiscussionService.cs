using System;
using project.Models.Posts;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Services.Implements;

public class DiscussionService : IDiscussionService
{
    private readonly IDiscussionRepository _discussionRepository;
    private readonly IStudentRepository _studentRepository;

    public DiscussionService(IDiscussionRepository discussionRepository, IStudentRepository studentRepository)
    {
        _discussionRepository = discussionRepository;
        _studentRepository = studentRepository;
    }

    // Hàm map chung
    private static DiscussionDto MapToDto(Discussion d)
    {
        return new DiscussionDto
        {
            Id = d.Id,
            StudentId = d.StudentId,
            StudentName = d.Student?.User?.FullName ?? "(Ẩn danh)",
            AvatarUrl = d.Student?.User?.AvatarUrl,
            TargetType = d.TargetType,
            TargetTypeId = d.TargetTypeId,
            ParentDiscussionId = d.ParentDiscussionId,
            Content = d.Content,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };
    }

    // Lấy tất cả comment
    public async Task<IEnumerable<DiscussionDto>> GetAllCommentsAsync()
    {
        var discussions = await _discussionRepository.GetAllCommentsAsync();
        return discussions.Select(MapToDto);
    }

    // Hàm dùng chung cho mọi TargetType
    public async Task<IEnumerable<DiscussionDto>> GetCommentsByTargetAsync(string targetType, string targetId)
    {
        var discussions = await _discussionRepository.GetCommentsByTargetAsync(targetType, targetId);
        return discussions.Select(MapToDto);
    }

     public async Task<DiscussionDto> CreateAsync(
        string studentId,
        string content,
        string targetType,
        string targetTypeId,
        string? parentDiscussionId = null
    )
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new Exception("Content không được để trống.");

        // ✅ Kiểm tra targetType + targetTypeId tồn tại
        if (!await _discussionRepository.IsValidTargetAsync(targetType, targetTypeId))
            throw new Exception($"TargetType '{targetType}' và TargetTypeId '{targetTypeId}' không hợp lệ.");

        // ✅ Kiểm tra parentDiscussionId nếu có
        if (!string.IsNullOrEmpty(parentDiscussionId))
        {
            var parent = await _discussionRepository.GetByIdAsync(parentDiscussionId);
            if (parent == null)
                throw new Exception("ParentDiscussionId không tồn tại.");
        }

        var discussion = new Discussion
        {
            StudentId = studentId,
            Content = content,
            TargetType = targetType,
            TargetTypeId = targetTypeId,
            ParentDiscussionId = parentDiscussionId,
            CreatedAt = DateTime.Now
        };

        var created = await _discussionRepository.CreateAsync(discussion);
        return MapToDto(created);
    }


   

    public async Task<DiscussionDto> UpdateAsync(string studentId, string discussionId, UpdateDiscussionRequest dto)
    {
        var discussion = await _discussionRepository.GetByIdAsync(discussionId);
        if (discussion == null)
            throw new Exception("Discussion không tồn tại.");
        if (discussion.StudentId != studentId)
            throw new Exception("Bạn không có quyền sửa Discussion này.");

        discussion.Content = dto.Content;
        discussion.UpdatedAt = DateTime.Now;

        var updated = await _discussionRepository.UpdateAsync(discussion);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(string? studentId, string discussionId, bool isAdmin = false)
    {
        var discussion = await _discussionRepository.GetByIdAsync(discussionId);
        if (discussion == null)
            throw new Exception("Discussion không tồn tại.");
        
        if (!isAdmin && discussion.StudentId != studentId)
            throw new Exception("Bạn không có quyền xóa Discussion này.");

        await _discussionRepository.DeleteAsync(discussion);
    }

}
