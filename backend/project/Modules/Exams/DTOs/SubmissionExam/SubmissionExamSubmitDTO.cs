using System.ComponentModel.DataAnnotations;

public class SubmissionExamSubmitDTO
{
    [Required]
    public string StudentId { get; set; } = null!;
    [Required]
    public List<SubmissionAnswerSubmitDTO> AnswersSubmit { get; set; } = new List<SubmissionAnswerSubmitDTO>();
}