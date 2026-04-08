using System.ComponentModel.DataAnnotations;

public class CreateFullQuestionExamDTO
{
    [Required]
    public string Content { get; set; } = null!;
    [Required]
    public string Explanation { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public bool IsRequired { get; set; }
    [Required, Range(1, 3)]
    public double Score { get; set; }
    [Required, Range(0, int.MaxValue)]
    public int Order { get; set; }
    [Required]
    public string Type { get; set; } = null!;
    [Required]
    public List<AddChoiceDTO> Answers { get; set; } = [];
}