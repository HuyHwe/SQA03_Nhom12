public class SubmissionExamDetailDTO
{
    public string SubmissionExamId { get; set; } = null!;
    public string ExamId { get; set; } = null!;

    public DateTime AttemptedAt { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int TotalCorrect { get; set; }
    public int TotalCount { get; set; }
    public double Score { get; set; }

}