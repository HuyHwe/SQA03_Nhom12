using System;

namespace project.Modules.Posts.DTOs;

public class DiscussionDto
{
    public string Id { get; set; } = null!;
        public string? StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? AvatarUrl { get; set; }

        public string? TargetType { get; set; }
        public string? TargetTypeId { get; set; }
        public string? ParentDiscussionId { get; set; }

        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
}
