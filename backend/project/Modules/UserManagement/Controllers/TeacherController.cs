using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "Teacher")]
[Route("api/teacher")]
[ApiController]
public class TeacherController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ITeacherService _teacherService;

    public TeacherController(
        ICourseService courseService,
        ITeacherService teacherService)
    {
        _courseService = courseService;
        _teacherService = teacherService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        try
        {
            var teacherId = User.FindFirst("teacherId")?.Value;
            if (teacherId == null)
            {
                return Unauthorized(new APIResponse("error", "Teacher ID not found in token"));
            }

            var overview = await _teacherService.GetTeacherOverviewAsync(teacherId);
            return Ok(new APIResponse("success", "Overview retrieved successfully", overview));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving overview", ex.Message));
        }
    }
}