using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class SubmissionAnswer
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string SubmissionExamId { get; set; } = null!;
    public string QuestionExamId { get; set; } = null!;
    public string? SelectedChoiceId { get; set; } // Nullable to handle unanswered questions
    public string? AnswerText { get; set; } // For text-based answers
    public bool IsCorrect { get; set; } = false;
    public double? ScoreAwarded { get; set; } = 0.0;

    [ForeignKey(nameof(SubmissionExamId))]
    public SubmissionExam SubmissionExam { get; set; } = null!;
    [ForeignKey(nameof(QuestionExamId))]
    public QuestionExam QuestionExam { get; set; } = null!;
    [ForeignKey(nameof(SelectedChoiceId))]
    public Choice? SelectedChoice { get; set; } // Nullable navigation property

}