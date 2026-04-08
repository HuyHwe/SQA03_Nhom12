using System;

namespace project.Modules.Posts.DTOs;

public class PostCreateDto
{
    public string Title { get; set; } = null!;
    public string? ContentJson { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Tags { get; set; }
    public bool IsPublished { get; set; } = false;

}
