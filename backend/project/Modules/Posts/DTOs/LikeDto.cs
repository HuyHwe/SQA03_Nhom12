using System;

namespace project.Modules.Posts.DTOs;

public class LikeDto
{
     public string Id { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string StudentName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? TargetType { get; set; }
    public string? TargetId { get; set; }
    public DateTime CreatedAt { get; set; }

    public bool Liked { get; set; }
    public int LikeCount { get; set; }

}
