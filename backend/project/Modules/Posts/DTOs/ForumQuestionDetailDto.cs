using System;

namespace project.Modules.Posts.DTOs;

public class ForumQuestionDetailDto : ForumQuestionDto
{

    public string? ContentJson { get; set; }
    public DateTime UpdatedAt { get; set; }
}
