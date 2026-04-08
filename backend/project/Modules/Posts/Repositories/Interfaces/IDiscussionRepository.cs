using System;
using project.Models;
using project.Models.Posts;

namespace project.Modules.Posts.Repositories.Interfaces;

public interface IDiscussionRepository
{
  //  Lấy tất cả comment trong hệ thống
  Task<IEnumerable<Discussion>> GetAllCommentsAsync();

  //  Lấy = comment của một bài Post hoặc ForumQuestion hoặc Course
  Task<IEnumerable<Discussion>> GetCommentsByTargetAsync(string targetType, string targetId);

  // Lấy comment dựa trên id
  Task<Discussion?> GetByIdAsync(string id);
  Task<Discussion> CreateAsync(Discussion discussion);
  Task<Discussion> UpdateAsync(Discussion discussion);
  Task DeleteAsync(Discussion discussion);

    // Kiểm tra targetType + targetTypeId tồn tại
    Task<bool> IsValidTargetAsync(string targetType, string targetTypeId);




  
}
