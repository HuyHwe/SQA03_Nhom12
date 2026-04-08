using System;
using Microsoft.EntityFrameworkCore;
using project.Models.Posts;
using project.Modules.Posts.Repositories.Interfaces;

namespace project.Modules.Posts.Repositories.Implements;

public class ReportRepository : IReportRepository
{
private readonly DBContext _context;

    public ReportRepository(DBContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Reports report)
    {
        await _context.Reports.AddAsync(report);
    }

    public async Task<Reports?> GetByIdAsync(string id)
    {
        return await _context.Reports
            .Include(r => r.Student)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<Reports>> GetAllAsync()
    {
        return await _context.Reports
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public void Delete(Reports report)
    {
        _context.Reports.Remove(report);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
