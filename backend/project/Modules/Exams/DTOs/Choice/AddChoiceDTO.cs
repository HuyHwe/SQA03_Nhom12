using System.ComponentModel.DataAnnotations;

public class AddChoiceDTO
{
    [Required]
    public string Content { get; set; } = null!;
    [Required]
    public bool IsCorrect { get; set; }
}