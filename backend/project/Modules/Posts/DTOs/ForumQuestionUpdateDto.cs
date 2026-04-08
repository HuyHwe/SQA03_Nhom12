using System;

namespace project.Modules.Posts.DTOs;

public class ForumQuestionUpdateDto
{
    public string Title { get; set; } = null!;
        public string? ContentJson { get; set; }
        public string? Tags { get; set; }

}
