using System.ComponentModel.DataAnnotations;

public class ChoiceUpdateDTO
{
    [Required]
    public string Content { get; set; } = null!;
}