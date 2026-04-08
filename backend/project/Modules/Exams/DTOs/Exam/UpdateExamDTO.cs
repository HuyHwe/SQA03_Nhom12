using System.ComponentModel.DataAnnotations;

public class UpdateExamDTO
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    [Range(1, 200)]
    public int DurationMinutes { get; set; }
    public bool IsOpened { get; set; } = false;
}