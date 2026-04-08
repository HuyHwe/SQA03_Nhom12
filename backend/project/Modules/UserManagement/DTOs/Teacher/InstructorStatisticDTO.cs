public class InstructorStatisticDTO
{
    public int TotalCourses { get; set; } = 0;
    public int TotalPublishedCourses { get; set; } = 0;
    public int TotalDraftCourses { get; set; } = 0;
    public int TotalPendingCourses { get; set; } = 0;
    public int TotalRejectedCourses { get; set; } = 0;
    public int TotalEnrollments { get; set; } = 0;
    public double AverageRating { get; set; } = 0.0;
    public double TotalRevenue { get; set; } = 0.0;
}
