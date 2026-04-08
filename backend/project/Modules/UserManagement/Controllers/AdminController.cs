using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "Admin")]
[Route("api/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetCourseByStatusAsync(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found in token"));
            }
            var courses = await _adminService.GetCoursesByAdminAsync(userId, status, page, pageSize);
            return Ok(new APIResponse("success", "Courses retrieved successfully", courses));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving courses", ex.Message));
        }
    }

    [HttpGet("full-course/{courseId}")]
    public async Task<IActionResult> GetFullCourseByIdAsync(string courseId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found in token"));
            }
            var course = await _adminService.GetFullCourseByIdAsync(userId, courseId);
            return Ok(new APIResponse("success", "Course details retrieved successfully", course));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving course details", ex.Message));
        }
    }

    [HttpPatch("courses/{courseId}/approve")]
    public async Task<IActionResult> AdminApproveCourseAsync(string courseId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found"));
            }
            await _adminService.AdminApproveCourseAsync(userId, courseId);
            return Ok(new APIResponse("success", "Course approved successfully"));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", ex.Message));
        }
    }

    [HttpPatch("courses/{courseId}/reject")]
    public async Task<IActionResult> AdminRejectCourseAsync(string courseId, [FromBody] RejectCourseDTO rejectRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid request data", ModelState));
        }
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found"));
            }
            await _adminService.AdminRejectCourseAsync(userId, courseId, rejectRequest.RejectReason);
            return Ok(new APIResponse("success", "Course rejected successfully"));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", ex.Message));
        }
    }

    // [HttpGet("courses/refunds/pending")]
    // public async Task<IActionResult> GetPendingRefundRequestsAsync()
    // {
    //     try
    //     {
    //         var refunds = await _adminService.GetPendingRefundRequestsAsync();
    //         return Ok(new APIResponse("success", "Pending refund requests retrieved successfully", refunds));
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(StatusCodes.Status500InternalServerError, new
    //         APIResponse("error", "An error occurred while retrieving refund requests", ex.Message));
    //     }
    // }

    [HttpPost("{courseId}/admin-review-course")]
    public async Task<IActionResult> AdminReviewCourse(string courseId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found in token"));
            }

            await _adminService.AdminReviewCourseAsync(userId, courseId);

            return Ok(new APIResponse("success", "Course reviewed successfully"));
        }
        catch (InvalidOperationException invOpEx)
        {
            return Conflict(
                new APIResponse("error", invOpEx.Message)
            );
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while reviewing the course", ex.Message));
        }
    }

    [HttpGet("{courseId}/lessons/{lessonId}/admin-review-lesson")]
    public async Task<IActionResult> AdminReviewLesson(string courseId, string lessonId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new APIResponse("error", "User ID not found in token"));
            }

            var lessonData = await _adminService.AdminReviewLessonAsync(userId, courseId, lessonId);

            return Ok(new APIResponse("success", "Lesson reviewed successfully", lessonData));
        }
        catch (InvalidOperationException invOpEx)
        {
            return Conflict(
                new APIResponse("error", invOpEx.Message)
            );
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("error", knfEx.Message));
        }
        catch (UnauthorizedAccessException uaEx)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while reviewing the lesson", ex.Message));
        }
    }
}