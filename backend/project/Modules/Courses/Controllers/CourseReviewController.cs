using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/{courseId}/reviews")]
[ApiController]
public class CourseReviewController : ControllerBase
{
    private readonly ICourseReviewService _courseReviewService;
    public CourseReviewController(ICourseReviewService courseReviewService)
    {
        _courseReviewService = courseReviewService;
    }

    // Student only
    [HttpPost]
    public async Task<IActionResult> AddCourseReviewAsync(string courseId, [FromBody] CourseReviewCreateDTO courseReviewCreateDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            await _courseReviewService.AddCourseReviewAsync(courseId, studentId, courseReviewCreateDTO);
            return Ok(new APIResponse("success", "Review added successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while posting the review.", ex.Message));
        }
    }

    // All users
    [HttpGet]
    public async Task<IActionResult> GetAllReviewsByCourseIdAsync(string courseId)
    {
        try
        {
            var reviews = await _courseReviewService.GetAllReviewsByCourseIdAsync(courseId);
            return Ok(new APIResponse("success", "Reviews retrieved successfully", reviews));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while retrieving the reviews.", ex));
        }
    }

    // Student only
    [HttpPatch("{reviewId}")]
    public async Task<IActionResult> UpdateCourseReviewAsync(string reviewId, [FromBody] CourseReviewUpdateDTO courseReviewUpdateDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            await _courseReviewService.UpdateCourseReviewAsync(reviewId, courseReviewUpdateDTO);
            return Ok(new APIResponse("success", "Review updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while updating the review.", ex));
        }
    }

    [Authorize(Roles = "Student")]
    [HttpGet("has-reviewed")]
    public async Task<IActionResult> CheckReviewedByStudentAsync(string courseId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var hasReviewed = await _courseReviewService.CheckReviewedCourseAsync(courseId, studentId);
            return Ok(new APIResponse("success", "Check review status successfully", new { hasReviewed }));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while checking the review status.", ex.Message));
        }
    }
}