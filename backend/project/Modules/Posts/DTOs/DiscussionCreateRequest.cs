using System;

namespace project.Modules.Posts.DTOs;

public class CreateDiscussionRequest
{
        public string TargetType { get; set; } = null!;
        public string TargetTypeId { get; set; } = null!;
        public string? ParentDiscussionId { get; set; }
        public string Content { get; set; } = null!;

}
