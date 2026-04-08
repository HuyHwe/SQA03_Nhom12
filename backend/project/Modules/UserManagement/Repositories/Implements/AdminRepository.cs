using Microsoft.EntityFrameworkCore;
using project.Models;

public class AdminRepository : IAdminRepository
{
    private readonly DBContext _dbContext;

    public AdminRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Admin methods for managing courses
    public async Task<(IEnumerable<Course>, int)> GetCoursesByAdminAsync(string? status, int page, int pageSize)
    {
        var query = _dbContext.Courses
            .Include(c => c.Category)
            .Include(c => c.Teacher)
                .ThenInclude(t => t.User)
            .Include(c => c.AdminReviewCourse)
                .ThenInclude(arc => arc.Admin)
                .ThenInclude(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(c => c.Status == status);
        }
        else
        {
            query = query.Where(c => c.Status == "pending");
        }

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, totalCount);
    }

    public async Task<Course?> GetFullCourseByIdAsync(string courseId)
    {
        return await _dbContext.Courses
            .Include(c => c.Category)
            .Include(c => c.Teacher)
                .ThenInclude(t => t.User)
            .Include(c => c.Content)
                .ThenInclude(cc => cc.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId);
    }

    public async Task<IEnumerable<UpdateRequestCourse>> GetUpdateRequestsByStatusAsync(string status)
    {
        return await _dbContext.UpdateRequestCourses
            .Where(urc => urc.Status == status)
            .ToListAsync();
    }

    public async Task<IEnumerable<UpdateRequestCourse>> GetAllUpdateRequestsAsync()
    {
        return await _dbContext.UpdateRequestCourses
            .ToListAsync();
    }

    public async Task<IEnumerable<RefundRequestCourse>> GetRefundRequestsByStatusAsync(string status)
    {
        return await _dbContext.RefundRequestCourses
            .Where(rrc => rrc.Status == status)
            .Include(rrc => rrc.Student)
            .ThenInclude(s => s.User)
            .Include(rrc => rrc.Admin)
            .Include(rrc => rrc.Enrollment)
            .ThenInclude(e => e.Course)
            .ToListAsync();
    }

    public async Task<bool> IsAdminExistAsync(string userId)
    {
        return await _dbContext.Admins
            .Include(a => a.User)
            .AnyAsync(a => a.User.Id == userId);
    }

    public async Task AdminReviewCourseAsync(AdminReviewCourse adminReviewCourse)
    {
        try
        {
            _dbContext.AdminReviewCourses.Add(adminReviewCourse);
            await _dbContext.SaveChangesAsync();

        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException(
                "Khóa học đã được admin khác nhận review"
            );
        }
    }

    public async Task<string> GetAdminIdAsync(string userId)
    {
        var admin = await _dbContext.Admins
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.User.Id == userId)
            ?? throw new KeyNotFoundException("Admin not found");
        return admin.AdminId;
    }

    public async Task<AdminReviewCourse?> GetAdminReviewCourseRecordAsync(string courseId)
    {
        return await _dbContext.AdminReviewCourses
            .FirstOrDefaultAsync(arc => arc.CourseId == courseId);
    }

    public async Task<string> GetAdminNameAsync(string adminId)
    {
        var admin = await _dbContext.Admins
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.AdminId == adminId)
            ?? throw new KeyNotFoundException("Admin not found");
        return admin.User.FullName;
    }

    public async Task<bool> IsAdminReviewCourseRecordExistAsync(string courseId)
    {
        return await _dbContext.AdminReviewCourses
            .AnyAsync(arc => arc.CourseId == courseId);
    }

    public async Task<IEnumerable<AdminReviewLesson>> GetAdminReviewedLessonsAsync(string adminId, string courseId)
    {
        return await _dbContext.AdminReviewLesson
            .Where(arl => arl.AdminId == adminId && arl.CourseId == courseId)
            .ToListAsync();
    }

    public async Task AdminReviewLessonAsync(AdminReviewLesson adminReviewLesson)
    {
        _dbContext.AdminReviewLesson.Add(adminReviewLesson);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> UpdateAdminReviewCourseAsync(string courseId, string status, string? rejectReason)
    {
        var adminReviewCourse = await _dbContext.AdminReviewCourses
            .FirstOrDefaultAsync(arc => arc.CourseId == courseId)
            ?? throw new KeyNotFoundException("Admin review course record not found");

        adminReviewCourse.Status = status;
        adminReviewCourse.Reason = rejectReason;
        _dbContext.AdminReviewCourses.Update(adminReviewCourse);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}