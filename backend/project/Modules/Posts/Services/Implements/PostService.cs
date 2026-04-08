using System;
using project.Models.Posts;
using project.Models.Posts.DTOs;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Services.Implements;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;

    public PostService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    private static void MapSoftDelete(Post source, PostDto target)
    {
        target.IsDeleted = source.IsDeleted;
        target.DeletedAt = source.DeletedAt;
    }

    private static PostDto MapToListDto(Post p)
    {
        var dto = new PostDto
        {
            Id = p.Id,
            Title = p.Title ?? string.Empty,
            ThumbnailUrl = p.ThumbnailUrl,
            Tags = p.Tags,
            ViewCount = p.ViewCount,
            LikeCount = p.LikeCount,
            DiscussionCount = p.DiscussionCount,
            IsPublished = p.IsPublished,
            CreatedAt = p.CreatedAt,
            AuthorId = p.AuthorId,
            AuthorName = p.Student?.User?.FullName ?? "(Không rõ)"
        };
        MapSoftDelete(p, dto);
        return dto;
    }


    // ✅ GET /api/posts
    public async Task<IEnumerable<PostDto>> GetAllPostsAsync()
    {
        var posts = await _postRepository.GetAllPostsAsync();
        return posts.Select(MapToListDto);
    }


    // ============================
    //  PHÂN TRANG + LỌC TAGS
    // ============================
    public async Task<(List<PostDto> Items, int TotalRecords)> GetPagedPostsByTagsAsync(
        int page,
        int pageSize,
        List<string>? tags
    )
    {
        var (items, totalRecords) = await _postRepository.GetPagingAsync(page, pageSize, tags);

        var mapped = items.Select(p => new PostDto
        {
            Id = p.Id,
            Title = p.Title ?? string.Empty,
            Tags = p.Tags,
            ThumbnailUrl = p.ThumbnailUrl,
            LikeCount = p.LikeCount,
            ViewCount = p.ViewCount,
            CreatedAt = p.CreatedAt,
            AuthorId = p.AuthorId,
            AuthorName = p.Student?.User?.FullName ?? "Ẩn danh",
            IsDeleted = p.IsDeleted,
            DeletedAt = p.DeletedAt
        }).ToList();

        return (mapped, totalRecords);
    }




    // ✅ GET /api/posts/member/{memberId}
    public async Task<IEnumerable<PostDto>> GetPostsByMemberIdAsync(string memberId)
    {
        var posts = await _postRepository.GetPostsByMemberIdAsync(memberId);
        return posts.Select(MapToListDto);
    }

    // ✅ GET /api/posts/search?tag=abc
    public async Task<IEnumerable<PostDto>> SearchPostsByTagAsync(string tag)
    {
        var posts = await _postRepository.SearchPostsByTagAsync(tag);
        return posts.Select(MapToListDto);
    }

    // ✅ GET /api/posts/{id}
    public async Task<PostDetailDto?> GetPostByIdAsync(string id)
    {
        var post = await _postRepository.GetPostByIdAsync(id);
        if (post == null) return null;

        var dto = new PostDetailDto
        {
            Id = post.Id,
            Title = post.Title ?? string.Empty,
            ThumbnailUrl = post.ThumbnailUrl,
            Tags = post.Tags,
            ViewCount = post.ViewCount,
            LikeCount = post.LikeCount,
            DiscussionCount = post.DiscussionCount,
            IsPublished = post.IsPublished,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            AuthorId = post.AuthorId,
            AuthorName = post.Student?.User?.FullName ?? "(Không rõ)",
            ContentJson = post.ContentJson
        };
        MapSoftDelete(post, dto);
        return dto;
    }

    // ✅ GET /api/posts/{id}
    public async Task<PostDetailDto?> GetAllPostByIdAsync(string id)
    {
        var post = await _postRepository.GetAllPostByIdAsync(id);
        if (post == null) return null;

        var dto = new PostDetailDto
        {
            Id = post.Id,
            Title = post.Title ?? string.Empty,
            ThumbnailUrl = post.ThumbnailUrl,
            Tags = post.Tags,
            ViewCount = post.ViewCount,
            LikeCount = post.LikeCount,
            DiscussionCount = post.DiscussionCount,
            IsPublished = post.IsPublished,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            AuthorId = post.AuthorId,
            AuthorName = post.Student?.User?.FullName ?? "(Không rõ)",
            ContentJson = post.ContentJson
        };
        MapSoftDelete(post, dto);
        return dto;
    }


    public async Task<PostDto> CreatePostAsync(PostCreateDto dto, string authorId, string authorName)
    {
        var post = new Post
        {
            Title = dto.Title,
            ContentJson = dto.ContentJson,
            ThumbnailUrl = dto.ThumbnailUrl,
            Tags = dto.Tags,
            IsPublished = dto.IsPublished,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false,
            DeletedAt = null
        };

        var created = await _postRepository.AddPostAsync(post);

        var result = MapToListDto(created);
        result.AuthorName = authorName; // override tên author từ param
        return result;
    }


    // Cập nhật post
    public async Task<PostDto> UpdatePostAsync(string id, PostUpdateDto dto, string authorId)
    {
        var post = await _postRepository.GetPostByIdAsync(id);
        if (post == null || post.IsDeleted)
            throw new Exception("Post not found or has been deleted");

        if (post.AuthorId != authorId)
            throw new Exception("You are not the author of this post: " + authorId);

        if (!string.IsNullOrEmpty(dto.Title))
            post.Title = dto.Title;
        if (!string.IsNullOrEmpty(dto.ContentJson))
            post.ContentJson = dto.ContentJson;
        if (!string.IsNullOrEmpty(dto.ThumbnailUrl))
            post.ThumbnailUrl = dto.ThumbnailUrl;
        if (!string.IsNullOrEmpty(dto.Tags))
            post.Tags = dto.Tags;
        if (dto.IsPublished.HasValue)
            post.IsPublished = dto.IsPublished.Value;

        post.UpdatedAt = DateTime.UtcNow;

        await _postRepository.UpdateAsync(post);
        return MapToListDto(post);
    }

    // Xóa mềm
    public async Task<bool> SoftDeletePostAsync(string id, string authorId)
    {
        var post = await _postRepository.GetPostByIdAsync(id);
        if (post == null || post.IsDeleted)
            throw new Exception("Post not found or already deleted");

        if (post.AuthorId != authorId)
            throw new Exception("You are not the author of this post");

        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;
        await _postRepository.UpdateAsync(post);
        return true;
    }

    // Xóa cứng
    public async Task<bool> HardDeletePostAsync(string id, string? authorId, bool isAdmin = false)
    {
        var post = await _postRepository.GetAllPostByIdAsync(id);
        if (post == null)
            throw new Exception("Post not found");

        if (!isAdmin && post.AuthorId != authorId)
            throw new Exception("You are not the author of this post");

        await _postRepository.RemoveAsync(post);
        return true;
    }

    // Khôi phục post đã xóa mềm
    public async Task<PostDto> RestorePostAsync(string id, string authorId)
    {
        var post = await _postRepository.GetAllPostByIdAsync(id);
        if (post == null)
            throw new Exception("Post not found");

        if (post.AuthorId != authorId)
            throw new Exception("You are not the author of this post: " + authorId + "--" + post.AuthorId);

        if (!post.IsDeleted)
            throw new Exception("Post is not deleted");

        post.IsDeleted = false;
        post.DeletedAt = null;
        post.UpdatedAt = DateTime.UtcNow;

        await _postRepository.UpdateAsync(post);

        return MapToListDto(post);
    }

    // Lấy danh sách post đã xóa mềm của author
    public async Task<IEnumerable<PostDto>> GetDeletedPostsByAuthorAsync(string authorId)
    {
        var posts = await _postRepository.GetPostsByAuthorDeletedAsync(authorId);
        return posts.Select(MapToListDto);
    }

    public async Task<bool> IncreaseViewCountAsync(string id)
    {
        return await _postRepository.IncreaseViewCountAsync(id);
    }



}
