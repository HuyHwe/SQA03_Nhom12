using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/courses/{courseId}/content")]
[ApiController]
public class CourseContentController : ControllerBase
{
    private readonly ICourseContentService _courseContentService;
    private readonly IRequestUpdateService _requestUpdateService;

    public CourseContentController(
        ICourseContentService courseContentService,
        IRequestUpdateService requestUpdateService)
    {
        _courseContentService = courseContentService;
        _requestUpdateService = requestUpdateService;
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> AddCourseContent(string courseId, [FromBody] CourseContentCreateDTO contentDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _courseContentService.AddCourseContentAsync(userId, courseId, contentDto);
            return Ok(new APIResponse("success", "Course content added successfully"));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while adding course content", ex.Message));
        }
    }

    // All users
    [HttpGet]
    public async Task<IActionResult> GetCourseContentByCourseId(string courseId)
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            var contentDto = await _courseContentService.GetCourseContentInformationDTOAsync(teacherId, courseId);
            return Ok(new APIResponse("success", "Course content retrieved successfully", contentDto));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving course content", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("overview")]
    public async Task<IActionResult> GetCourseContentOverview(string courseId)
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            var contentDto = await _courseContentService.GetCourseContentOverviewDTOAsync(teacherId, courseId);

            return Ok(new APIResponse("success", "Course content overview retrieved successfully", contentDto));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving course content overview", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPatch]
    public async Task<IActionResult> UpdateCourseContent(string contentId, [FromBody] CourseContentUpdateDTO contentDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _courseContentService.UpdateCourseContentAsync(userId, contentId, contentDto);
            return Ok(new APIResponse("success", "Course content updated successfully"));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating course content", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost("request-update")]
    public async Task<IActionResult> RequestUpdateCourseContent([FromBody] RequestUpdateRequestDTO requestDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _requestUpdateService.CreateRequestUpdateAsync(userId, requestDto);
            return Ok(new APIResponse("success", "Update request created successfully"));
        }
        catch (ArgumentException argEx)
        {
            return BadRequest(new APIResponse("error", argEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating update request", ex.Message));
        }
    }
}
