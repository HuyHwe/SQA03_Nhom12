using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/course-contents/{courseContentId}/lessons")]
[ApiController]
public class LessonController : ControllerBase
{
    private readonly ILessonService _lessonService;
    private readonly IRequestUpdateService _requestUpdateService;

    public LessonController(
        ILessonService lessonService,
        IRequestUpdateService requestUpdateService)
    {
        _lessonService = lessonService;
        _requestUpdateService = requestUpdateService;
    }

    // All users
    [HttpGet]
    public async Task<IActionResult> GetLessonsByCourseContentId(string courseContentId)
    {
        try
        {
            var lessons = await _lessonService.GetLessonsByCourseContentIdAsync(courseContentId);
            return Ok(new APIResponse("success", "Lessons retrieved successfully", lessons));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving lessons.",
                detail = ex.Message
            });
        }
    }

    // All users
    [HttpGet("{lessonId}")]
    public async Task<IActionResult> GetLessonById(string courseContentId, string lessonId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var lesson = await _lessonService.GetLessonByIdAsync(studentId, courseContentId, lessonId);
            return Ok(new APIResponse("success", "Lesson retrieved successfully", lesson));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> AddLesson(string courseContentId, [FromBody] LessonCreateDTO lessonDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _lessonService.AddLessonAsync(userId, courseContentId, lessonDto);
            return Ok(new APIResponse("success", "Create lesson successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating the lesson", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPatch("{lessonId}")]
    public async Task<IActionResult> UpdateLesson(string courseContentId, string lessonId, [FromBody] LessonUpdateDTO lessonDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _lessonService.UpdateLessonAsync(userId, courseContentId, lessonId, lessonDto);
            return Ok(new APIResponse("success", "Update lesson successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating the lesson", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost("order")]
    public async Task<IActionResult> UpdateLessonOrder(string courseContentId, [FromBody] List<LessonOrderDTO> lessonOrders)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _lessonService.UpdateOrderLessonsAsync(userId, courseContentId, lessonOrders);
            return Ok(new APIResponse("success", "Update lesson orders successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating lesson orders", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost("{lessonId}/request-update")]
    public async Task<IActionResult> RequestUpdateLesson([FromBody] RequestUpdateRequestDTO requestDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _requestUpdateService.CreateRequestUpdateAsync(userId, requestDto);
            return Ok(new APIResponse("success", "Lesson update request created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating the lesson update request", ex.Message));
        }
    }
}