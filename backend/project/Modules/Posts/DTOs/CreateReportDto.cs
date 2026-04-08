using System;

namespace project.Modules.Posts.DTOs;

public class CreateReportDto
{
    public string TargetType { get; set; } = null!; // Post | Discussion | ForumQuestion
    public string TargetTypeId { get; set; } = null!;
    public string? Reason { get; set; }
    public string? Description { get; set; }
}
