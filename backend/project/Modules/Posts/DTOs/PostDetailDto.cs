using System;
using project.Models.Posts.DTOs;

namespace project.Modules.Posts.DTOs;

public class PostDetailDto : PostDto
{
    
        public string? ContentJson { get; set; }
        public DateTime UpdatedAt { get; set; }

}
