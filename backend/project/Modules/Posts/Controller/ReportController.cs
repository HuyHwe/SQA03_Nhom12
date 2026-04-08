using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
         private readonly IReportService _service;

    public ReportController(IReportService service)
    {
        _service = service;
    }

    // STUDENT báo cáo vi phạm
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReportDto dto)
    {
        var reporterId = User.Claims
            .FirstOrDefault(c => c.Type == "StudentId")?.Value;

        if (string.IsNullOrEmpty(reporterId))
            return Unauthorized();

        await _service.CreateReportAsync(reporterId, dto);
        return Ok(new { message = "Báo cáo đã được gửi và đang chờ duyệt." });
    }

    // ADMIN xem danh sách report
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // ADMIN duyệt report
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(string id)
    {
        await _service.ApproveAsync(id);
        return Ok(new { message = "Báo cáo đã được duyệt." });
    }

    // ADMIN từ chối report
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(string id)
    {
        await _service.RejectAsync(id);
        return Ok(new { message = "Báo cáo đã bị từ chối." });
    }

    // ADMIN xóa report
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteReportAsync(id);
        return Ok(new { message = "Xóa báo cáo thành công." });
    }
    }
}
