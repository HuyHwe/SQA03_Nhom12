using System.ComponentModel.DataAnnotations;

public class RejectCourseDTO
{
    [Required]
    public string RejectReason { get; set; } = null!;
}