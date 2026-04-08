using System;
using project.Models.Posts.DTOs;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetAllPostsAsync();
    Task<(List<PostDto> Items, int TotalRecords)> GetPagedPostsByTagsAsync(
        int page,
        int pageSize,
        List<string>? tags
    );
    Task<PostDetailDto?> GetPostByIdAsync(string id);
    Task<PostDetailDto?> GetAllPostByIdAsync(string id);
    Task<IEnumerable<PostDto>> SearchPostsByTagAsync(string tag);
    Task<PostDto> CreatePostAsync(PostCreateDto dto, string authorId, string authorName);
    Task<PostDto> UpdatePostAsync(string id, PostUpdateDto dto, string authorId);
    Task<bool> SoftDeletePostAsync(string id, string authorId);
    Task<bool> HardDeletePostAsync(string id, string? authorId, bool isAdmin = false);

    Task<PostDto> RestorePostAsync(string id, string authorId);
    Task<IEnumerable<PostDto>> GetPostsByMemberIdAsync(string memberId);

    Task<IEnumerable<PostDto>> GetDeletedPostsByAuthorAsync(string authorId);
    Task<bool> IncreaseViewCountAsync(string id);



}
