public class ChoiceForReviewDTO
{
    public string Id { get; set; } = null!;
    public string QuestionExamId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsCorrect { get; set; }
}