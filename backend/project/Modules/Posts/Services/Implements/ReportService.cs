using System;
using project.Models.Posts;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Services.Implements;

public class ReportService : IReportService
{
 private readonly IReportRepository _repository;

    public ReportService(IReportRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateReportAsync(string reporterId, CreateReportDto dto)
    {
        var report = new Reports
        {
            ReporterId = reporterId,
            TargetType = dto.TargetType,
            TargetTypeId = dto.TargetTypeId,
            Reason = dto.Reason,
            Description = dto.Description,
            Status = "Pending"
        };

        await _repository.AddAsync(report);
        await _repository.SaveChangesAsync();
    }

    public async Task<List<ReportDto>> GetAllAsync()
    {
        var reports = await _repository.GetAllAsync();

        return reports.Select(r => new ReportDto
        {
            Id = r.Id,
            ReporterId = r.ReporterId!,
            TargetType = r.TargetType!,
            TargetTypeId = r.TargetTypeId!,
            Reason = r.Reason,
            Description = r.Description,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public async Task ApproveAsync(string reportId)
    {
        var report = await _repository.GetByIdAsync(reportId)
            ?? throw new Exception("Report not found");

        report.Status = "Resolved";
        await _repository.SaveChangesAsync();
    }

    public async Task RejectAsync(string reportId)
    {
        var report = await _repository.GetByIdAsync(reportId)
            ?? throw new Exception("Report not found");

        report.Status = "Rejected";
        await _repository.SaveChangesAsync();
    }

    public async Task DeleteReportAsync(string id)
    {
        var report = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Report not found");

        _repository.Delete(report);
        await _repository.SaveChangesAsync();
    }
}
