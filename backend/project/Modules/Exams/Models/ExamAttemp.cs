using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class ExamAttemp
{
    [Key]
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

    [ForeignKey(nameof(ExamId))]
    public Exam Exam { get; set; } = null!;
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;
}