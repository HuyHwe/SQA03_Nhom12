public class SubmittedExamDTO
{
    public string SubmissionExamId { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string ExamId { get; set; } = null!;
    public string ExamAttemptId { get; set; } = null!;
    public DateTime SubmittedAt { get; set; }
    public int TotalCorrect { get; set; }
    public double Score { get; set; }
}