using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models;

public class Material
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string LessonId { get; set; } = null!;

    [Required, MaxLength(500)]
    public string FileUrl { get; set; } = null!;

    [MaxLength(50)]
    public string FileStyle { get; set; } = string.Empty;

    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

}
