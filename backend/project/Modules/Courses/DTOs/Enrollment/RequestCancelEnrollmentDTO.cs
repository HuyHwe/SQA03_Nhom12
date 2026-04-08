using System.ComponentModel.DataAnnotations;

public class RequestCancelEnrollmentDTO
{
    [Required]
    public string ReasonRequest { get; set; } = null!;
}