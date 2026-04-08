using Microsoft.EntityFrameworkCore;

public class TeacherRepository : ITeacherRepository
{
    private readonly DBContext _dbContext;
    public TeacherRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> IsTeacherExistsAsync(string teacherId)
    {
        return await _dbContext.Teachers.AnyAsync(t => t.TeacherId == teacherId);
    }

    public async Task<InstructorStatisticDTO> GetInstructorStatisticsAsync(string teacherId)
    {
        var courseStats = await _dbContext.Courses
            .Where(c => c.TeacherId == teacherId)
            .GroupBy(c => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Published = g.Count(c => c.Status == "published"),
                Pending = g.Count(c => c.Status == "pending"),
                Rejected = g.Count(c => c.Status == "rejected"),
                Draft = g.Count(c => c.Status == "draft"),
                AvgRating = g.Where(c => c.AverageRating > 0.0).Average(c => (double?)c.AverageRating) ?? 0.0,
            })
            .FirstOrDefaultAsync();

        var totalEnrollments = await _dbContext.Enrollments
            .Where(e => e.Course.TeacherId == teacherId)
            .CountAsync();

        return new InstructorStatisticDTO
        {
            TotalCourses = courseStats?.Total ?? 0,
            TotalPublishedCourses = courseStats?.Published ?? 0,
            TotalPendingCourses = courseStats?.Pending ?? 0,
            TotalRejectedCourses = courseStats?.Rejected ?? 0,
            TotalDraftCourses = courseStats?.Draft ?? 0,
            TotalEnrollments = totalEnrollments,
            AverageRating = courseStats?.AvgRating ?? 0.0,
            // TotalRevenue = totalRevenue
        };
    }
}