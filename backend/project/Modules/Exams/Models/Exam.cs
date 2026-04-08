using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models;

public class Exam
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string? CourseContentId { get; set; }
    public string? LessonId { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalCompleted { get; set; } = 0;
    public bool IsOpened { get; set; } = false;


    [ForeignKey(nameof(CourseContentId))]
    public CourseContent? CourseContent { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson? Lesson { get; set; }

    public ICollection<QuestionExam> Questions { get; set; } = new List<QuestionExam>();
    public ICollection<SubmissionExam> Submissions { get; set; } = new List<SubmissionExam>();
    public ICollection<ExamAttemp> ExamAttemps { get; set; } = new List<ExamAttemp>();
}