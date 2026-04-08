using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class SubmissionExam
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string StudentId { get; set; } = null!;
    public string ExamId { get; set; } = null!;
    public string? ExamAttemptId { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public int TotalCorrect { get; set; } = 0;
    public double Score { get; set; } = 0.0;

    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;
    [ForeignKey(nameof(ExamId))]
    public Exam Exam { get; set; } = null!;
    [ForeignKey(nameof(ExamAttemptId))]
    public ExamAttemp ExamAttempt { get; set; } = null!;

    public ICollection<SubmissionAnswer> SubmissionAnswers { get; set; } = new List<SubmissionAnswer>();
}