using System.ComponentModel.DataAnnotations;

public class RequestUpdateRequestDTO
{
    [Required]
    public string TargetType { get; set; } = null!;
    [Required]
    public string TargetId { get; set; } = null!;
    [Required]
    public string UpdatedDataJSON { get; set; } = null!; // serialize DTO
}