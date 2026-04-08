using Microsoft.EntityFrameworkCore;
using project.Models;

public class CourseRepository : ICourseRepository
{
    private readonly DBContext _dbContext;
    public CourseRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CourseExistsAsync(string id)
    {
        return await _dbContext.Courses
            .Where(c => c.Status == "published")
            .AnyAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Course>> GetAllCoursesAsync()
    {
        return await _dbContext.Courses
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.User)
            .Where(c => c.Status == "published")
            .ToListAsync();
    }

    public async Task<(IEnumerable<Course>, int)> SearchItemsAsync(string? keyword, string? category, int page, int pageSize)
    {
        var query = _dbContext.Courses
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.User)
            .Where(c => c.Status == "published")
            .AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(c => c.Title.Contains(keyword));
        }
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(c => c.Category.Id == category);
        }

        var totalItems = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalItems);
    }

    public async Task<Course?> GetCourseByIdAsync(string id)
    {
        return await _dbContext.Courses
            .Where(c => c.Status == "published")
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Course?> GetCourseByStatusAsync(string id, string status)
    {
        return await _dbContext.Courses
            .Where(c => c.Status == status)
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    // public async Task<IEnumerable<Course>> GetCoursesByCategoryAsync(string categoryId)
    // {
    //     return await _dbContext.Courses
    //         .Where(c => c.CategoryId == categoryId)
    //         .Include(c => c.Category)
    //         .Include(c => c.Teacher)
    //         .ToListAsync();
    // }

    public async Task<(IEnumerable<Course>, int)> GetCoursesByTeacherIdAsync(
        string teacherId,
        string? keyword,
        string? status,
        string? sort,
        int page,
        int pageSize)
    {
        var query = _dbContext.Courses
            .Where(c => c.TeacherId == teacherId && (string.IsNullOrEmpty(status) || c.Status == status))
            .Include(c => c.Enrollments)
            .Include(c => c.Category)
            .Include(c => c.Teacher)
                .ThenInclude(t => t.User)
            .Include(c => c.AdminReviewCourse)
                .ThenInclude(arc => arc.Admin)
                .ThenInclude(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(e => e.Title.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(sort))
        {
            query = sort switch
            {
                "alphabet-desc" => query.OrderByDescending(e => e.Title),
                "alphabet-asc" => query.OrderBy(e => e.Title),
                "time-desc" => query.OrderByDescending(e => e.CreatedAt),
                "time-asc" => query.OrderBy(e => e.CreatedAt),
                "popular-desc" => query.OrderByDescending(e => e.Enrollments.Count()),
                "popular-asc" => query.OrderBy(e => e.Enrollments.Count()),
                _ => query.OrderByDescending(e => e.CreatedAt)
            };
        }
        else
        {
            query = query.OrderByDescending(e => e.CreatedAt);
        }

        var totalItems = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalItems);
    }

    public async Task<(IEnumerable<Enrollment_course>, int)> GetEnrolledCoursesByStudentIdAsync(
        string studentId,
        string? keyword,
        string? status,
        string? sort,
        int page,
        int pageSize
    )
    {
        var query = _dbContext.Enrollments
            .Where(e => e.StudentId == studentId && (string.IsNullOrEmpty(status) || e.Status == status))
            .Include(e => e.Course)
                .ThenInclude(c => c.Category)
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
                    .ThenInclude(t => t.User)
            .Include(e => e.Course)
            .AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(e => e.Course.Title.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(sort))
        {
            query = sort switch
            {
                "progress-desc" => query.OrderByDescending(e => e.Progress),
                "progress-asc" => query.OrderBy(e => e.Progress),
                _ => query.OrderByDescending(e => e.Progress)
            };
        }
        else
        {
            query = query.OrderByDescending(e => e.Progress);
        }

        var totalItems = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalItems);
    }

    public async Task AddCourseAsync(Course course)
    {
        await _dbContext.Courses.AddAsync(course);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateCourseAsync(Course course)
    {
        _dbContext.Courses.Update(course);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Course?> GetCourseByIdByTeacherAsync(string courseId, string teacherId)
    {
        return await _dbContext.Courses
            .Where(c => c.Id == courseId && c.TeacherId == teacherId)
            .Include(c => c.Category)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.User)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateCourseStatusAsync(string courseId, string status)
    {
        var course = await _dbContext.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null)
        {
            return false;
        }
        course.Status = status.ToLower();
        _dbContext.Courses.Update(course);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Course>> GetTopCoursesByTeacherAsync(string teacherId, int count)
    {
        return await _dbContext.Courses
            .Where(c => c.TeacherId == teacherId && c.Status == "published")
            .Include(c => c.Category)
            .Include(c => c.Teacher)
                .ThenInclude(t => t.User)
            .Include(c => c.Enrollments)
            .OrderByDescending(c => c.Enrollments.Count)
            .Take(count)
            .ToListAsync();
    }
}