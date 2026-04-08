using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentStatsController : ControllerBase
    {
         private readonly IStudentStatsService _service;

    public StudentStatsController(IStudentStatsService service)
    {
        _service = service;
    }

    // GET: api/studentstats?month=5
    [HttpGet]
    public async Task<IActionResult> GetStats([FromQuery] int? month)
    {
        var result = await _service.GetStatsAsync(month);
        return Ok(result);
    }
     // GET api/StudentStats/ifTeacher
        [HttpGet("ifTeacher")]
        public async Task<IActionResult> IfTeacher()
        {
            var studentId = User.Claims
                .FirstOrDefault(c => c.Type == "StudentId")
                ?.Value;

            if (string.IsNullOrEmpty(studentId))
                return Unauthorized("StudentId not found in token");

            var result = await _service.IsTeacherAsync(studentId);

            return Ok(result); // true / false
        }

         /// <summary>
    /// Lấy thống kê điểm của chính mình (từ JWT)
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyScores()
    {
        var studentId = User.Claims
            .FirstOrDefault(c => c.Type == "StudentId")?.Value;

        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var scores = await _service.GetStudentScoresAsync(studentId);

        if (scores == null)
            return NotFound();

        return Ok(new
        {
            totalScore = scores[0],
            currentMonthScore = scores[1],
            previousMonthScore = scores[2]
        });
    }
    }

    
}
