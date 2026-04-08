using System;
using project.Models.Posts;

namespace project.Modules.Posts.Repositories.Interfaces;

public interface IReportRepository
{
    Task AddAsync(Reports report);
    Task<Reports?> GetByIdAsync(string id);
    Task<List<Reports>> GetAllAsync();
    Task SaveChangesAsync();
    void Delete(Reports report);
}
