public class QuestionExamForReviewSubmissionDTO
{
    public string Id { get; set; } = null!;
    public string ExamId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string Type { get; set; } = null!;
    public string Explanation { get; set; } = null!;
    public double? Score { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public bool IsNewest { get; set; }
    public List<ChoiceForReviewDTO> Choices { get; set; } = new List<ChoiceForReviewDTO>();
}