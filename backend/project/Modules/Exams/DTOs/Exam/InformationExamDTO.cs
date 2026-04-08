public class InformationExamDTO
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalCompleted { get; set; }
    public bool IsOpened { get; set; }
    public string? CourseContentId { get; set; }
    public string? LessonId { get; set; }
    public string? CourseId { get; set; }
    public string? LessonTitle { get; set; }
    public string? CourseTitle { get; set; }
}