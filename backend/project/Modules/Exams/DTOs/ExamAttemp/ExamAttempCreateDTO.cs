using System.ComponentModel.DataAnnotations;

public class ExamAttempDTO
{
    [Required]
    public string Id { get; set; } = null!;
    [Required]
    public string ExamId { get; set; } = null!;
    [Required]
    public string StudentId { get; set; } = null!;
    [Required]
    public DateTime StartTime { get; set; }
    [Required]
    public DateTime EndTime { get; set; }
    [Required]
    public DateTime AttemptedAt { get; set; }
    [Required]
    public DateTime SubmittedAt { get; set; }
    public string? SavedAnswers { get; set; }
    [Required]
    public bool IsSubmitted { get; set; }
}