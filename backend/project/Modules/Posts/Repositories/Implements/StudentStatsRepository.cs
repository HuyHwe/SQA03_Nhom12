using System;
using Microsoft.EntityFrameworkCore;
using project.Data; // <-- Thêm using cho namespace chứa DbContext của bạn
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;

namespace project.Modules.Posts.Repositories.Implements;

public class StudentStatsRepository : IStudentStatsRepository
{
    private readonly DBContext _db;

    public StudentStatsRepository(DBContext db)
    {
        _db = db;
    }


    public async Task<List<StudentStatsDto>> GetStudentStatsAsync(int? month)
    {
        var query = _db.Students
            .Select(s => new StudentStatsDto
            {
                StudentId = s.StudentId,
                FullName = s.User.FullName,

                // Tổng tất cả thời gian
                TotalPosts = s.Posts.Count(),
                TotalDiscussions = s.Discussions.Count(),
                TotalForumQuestions = s.ForumQuestions.Count(),

                // Theo tháng
                MonthPosts = month == null
                    ? 0
                    : s.Posts.Count(p => p.CreatedAt.Month == month),

                MonthDiscussions = month == null
                    ? 0
                    : s.Discussions.Count(d => d.CreatedAt.Month == month),

                MonthForumQuestions = month == null
                    ? 0
                    : s.ForumQuestions.Count(f => f.CreatedAt.Month == month)
            });

        return await query
            .OrderByDescending(x => month == null ? x.TotalPosts : x.MonthPosts)
            .ThenByDescending(x => month == null ? x.TotalDiscussions : x.MonthDiscussions)
            .ToListAsync();
    }

     public async Task<bool> IsTeacherAsync(string studentId)
        {
            var now = DateTime.Now;

            int currentMonth = now.Month;
            int currentYear = now.Year;

            var prev = now.AddMonths(-1);
            int prevMonth = prev.Month;
            int prevYear = prev.Year;

            var data = await _db.Students
                .Where(s => s.StudentId == studentId)
                .Select(s => new
                {
                    // ===== TOTAL SCORE =====
                    TotalScore =
                        s.Discussions.Count() * 1
                        + s.Posts.Count() * 20
                        + s.ForumQuestions.Count(f => !f.IsDeleted) * 5,

                    // ===== CURRENT MONTH SCORE =====
                    CurrentMonthScore =
                        s.Discussions.Count(d =>
                            d.CreatedAt.Month == currentMonth &&
                            d.CreatedAt.Year == currentYear) * 1
                        +
                        s.Posts.Count(p =>
                            p.CreatedAt.Month == currentMonth &&
                            p.CreatedAt.Year == currentYear) * 20
                        +
                        s.ForumQuestions.Count(f =>
                            !f.IsDeleted &&
                            f.CreatedAt.Month == currentMonth &&
                            f.CreatedAt.Year == currentYear) * 5,

                    // ===== PREVIOUS MONTH SCORE =====
                    PreviousMonthScore =
                        s.Discussions.Count(d =>
                            d.CreatedAt.Month == prevMonth &&
                            d.CreatedAt.Year == prevYear) * 1
                        +
                        s.Posts.Count(p =>
                            p.CreatedAt.Month == prevMonth &&
                            p.CreatedAt.Year == prevYear) * 20
                        +
                        s.ForumQuestions.Count(f =>
                            !f.IsDeleted &&
                            f.CreatedAt.Month == prevMonth &&
                            f.CreatedAt.Year == prevYear) * 5
                })
                .FirstOrDefaultAsync();

            if (data == null)
                return false;

            return data.TotalScore > 100
                || data.CurrentMonthScore > 50
                || data.PreviousMonthScore > 50;
        }


         public async Task<int[]?> GetStudentScoresAsync(string studentId)
    {
        var now = DateTime.Now;

        int currentMonth = now.Month;
        int currentYear = now.Year;

        var prev = now.AddMonths(-1);
        int prevMonth = prev.Month;
        int prevYear = prev.Year;

        return await _db.Students
            .Where(s => s.StudentId == studentId)
            .Select(s => new int[]
            {
                // [0] TOTAL SCORE
                s.Discussions.Count() * 1
                + s.Posts.Count() * 20
                + s.ForumQuestions.Count(f => !f.IsDeleted) * 5,

                // [1] CURRENT MONTH SCORE
                s.Discussions.Count(d =>
                    d.CreatedAt.Month == currentMonth &&
                    d.CreatedAt.Year == currentYear) * 1
                +
                s.Posts.Count(p =>
                    p.CreatedAt.Month == currentMonth &&
                    p.CreatedAt.Year == currentYear) * 20
                +
                s.ForumQuestions.Count(f =>
                    !f.IsDeleted &&
                    f.CreatedAt.Month == currentMonth &&
                    f.CreatedAt.Year == currentYear) * 5,

                // [2] PREVIOUS MONTH SCORE
                s.Discussions.Count(d =>
                    d.CreatedAt.Month == prevMonth &&
                    d.CreatedAt.Year == prevYear) * 1
                +
                s.Posts.Count(p =>
                    p.CreatedAt.Month == prevMonth &&
                    p.CreatedAt.Year == prevYear) * 20
                +
                s.ForumQuestions.Count(f =>
                    !f.IsDeleted &&
                    f.CreatedAt.Month == prevMonth &&
                    f.CreatedAt.Year == prevYear) * 5
            })
            .FirstOrDefaultAsync();
    }

    
}
