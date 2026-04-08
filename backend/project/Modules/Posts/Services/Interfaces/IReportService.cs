using System;
using project.Modules.Posts.DTOs;

namespace project.Modules.Posts.Services.Interfaces;

public interface IReportService
{
    Task CreateReportAsync(string reporterId, CreateReportDto dto);
    Task<List<ReportDto>> GetAllAsync();
    Task ApproveAsync(string reportId);
    Task RejectAsync(string reportId);
    Task DeleteReportAsync(string id);
}
