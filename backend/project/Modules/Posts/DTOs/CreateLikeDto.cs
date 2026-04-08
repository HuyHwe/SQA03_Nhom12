using System;

namespace project.Modules.Posts.DTOs;

public class CreateLikeDto
{
    public string TargetType { get; set; } = null!;
    public string TargetId { get; set; } = null!;


}
