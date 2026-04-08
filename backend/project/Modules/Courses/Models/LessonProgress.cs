using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class LessonProgress
{
    [Key]
    public string Id { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string LessonId { get; set; } = null!;
    public DateTime CompletedAt { get; set; }

    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;
}