using System;
using System.ComponentModel.DataAnnotations;

namespace project.Modules.Posts.DTOs;

public class DiscussionCreateRequest
{
        public string Content { get; set; } = null!;

}
