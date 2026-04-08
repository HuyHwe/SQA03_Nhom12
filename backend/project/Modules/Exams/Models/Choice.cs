using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class Choice
{
    [Key]
    public string Id { get; set; } = null!;

    public string QuestionExamId { get; set; } = null!;
    [Required]
    public string Content { get; set; } = null!;
    public bool? IsCorrect { get; set; }

    [ForeignKey(nameof(QuestionExamId))]
    public QuestionExam QuestionExam { get; set; } = null!;
}