using System;
using project.Models.Posts;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface IDiscussionService
{
  // ✅ Lấy tất cả comment trong hệ thống
  Task<IEnumerable<DiscussionDto>> GetAllCommentsAsync();

  Task<IEnumerable<DiscussionDto>> GetCommentsByTargetAsync(string targetType, string targetId);
   Task<DiscussionDto> CreateAsync(string studentId, string Content,string targetType, string targetTypeId, string? parentDiscussionId = null);
  Task<DiscussionDto> UpdateAsync(string studentId, string discussionId, UpdateDiscussionRequest dto);
  Task DeleteAsync(string? studentId, string discussionId, bool isAdmin = false);
}
