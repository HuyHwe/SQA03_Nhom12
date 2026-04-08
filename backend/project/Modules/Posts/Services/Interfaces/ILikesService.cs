using System;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface ILikesService
{
    Task<IEnumerable<LikeDto>> GetAllLikesAsync();
    Task<IEnumerable<LikeDto>> GetLikesByTargetAsync(string targetType, string targetId);
    Task<IEnumerable<LikeDto>> GetLikesByStudentAsync(string studentId);
    Task<LikeDto> ToggleLikeAsync(string studentId, string targetType, string targetId);
    Task UpdateLikeCountAsync(string targetType, string targetId);

}
