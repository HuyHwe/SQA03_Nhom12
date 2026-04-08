public class AdminActionLog
{
    public int Id { get; set; }
    public string AdminId { get; set; } = null!;
    public string ActionType { get; set; } = null!;
    public string TargetType { get; set; } = null!;
    public string TargetId { get; set; } = null!;
    public string? Description { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Result { get; set; } = "Success";
}