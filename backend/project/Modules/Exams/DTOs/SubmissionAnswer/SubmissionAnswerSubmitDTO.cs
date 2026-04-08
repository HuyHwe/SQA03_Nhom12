using System.ComponentModel.DataAnnotations;

public class SubmissionAnswerSubmitDTO
{
    [Required]
    public string QuestionExamId { get; set; } = null!;
    public string? SelectedChoiceId { get; set; } // Nullable to handle unanswered questions
    public string? AnswerText { get; set; } // For text-based answers
}