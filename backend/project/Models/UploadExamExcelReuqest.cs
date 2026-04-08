using System.ComponentModel.DataAnnotations;

public class UploadExamExcelRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
    [Required]
    public string ExamId { get; set; } = null!;
}