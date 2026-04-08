using System;

namespace project.Modules.Posts.DTOs;

public class ReportDto
{
    public string Id { get; set; } = null!;
    public string ReporterId { get; set; } = null!;
    public string TargetType { get; set; } = null!;
    public string TargetTypeId { get; set; } = null!;
    public string? Reason { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
