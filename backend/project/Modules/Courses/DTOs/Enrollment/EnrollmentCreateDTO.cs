using System.ComponentModel.DataAnnotations;

public class EnrollmentCreateDTO
{
    [Required]
    public string StudentId { get; set; } = null!;
}