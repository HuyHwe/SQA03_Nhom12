using System;
using project.Models.Posts;

namespace project.Modules.Posts.Repositories.Interfaces;

public interface ILikesRepository
{
    Task AddAsync(Likes like);
    void Delete(Likes like);
    Task SaveChangesAsync();
    Task<IEnumerable<Likes>> GetAllLikesAsync();
    Task<IEnumerable<Likes>> GetLikesByTargetAsync(string targetType, string targetId);
    Task<IEnumerable<Likes>> GetLikesByStudentAsync(string studentId);
    Task<Likes?> GetLikeAsync(string studentId, string targetType, string targetId);
     Task<bool> ExistsTargetAsync(string targetType, string targetId);
    Task<int> CountLikesAsync(string targetType, string targetId);
    Task LoadStudentUserAsync(Likes like);
}
