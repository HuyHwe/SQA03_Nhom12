using System;
using System.ComponentModel.DataAnnotations;

namespace project.Modules.Posts.DTOs;

public class UpdateDiscussionRequest
{
     [Required]
     public string Content { get; set; } = null!;
}
