public class CreateQuestionExamDTO
{
    public string Content { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string Type { get; set; } = null!;
    public string Exaplanation { get; set; } = null!;
    public double Score { get; set; } = 1.0;
    public bool IsRequired { get; set; } = true;
}