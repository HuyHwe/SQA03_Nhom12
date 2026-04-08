using System;
using System.ComponentModel.DataAnnotations;

namespace project.Modules.Posts.DTOs;

public class DiscussionUpdateRequest
{
     [Required]
public string Content { get; set; } = null!;
}
