using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/courses/{courseId}/enrollments")]
[ApiController]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentCourseService _enrollmentCourseService;
    public EnrollmentController(IEnrollmentCourseService enrollmentCourseService)
    {
        _enrollmentCourseService = enrollmentCourseService;
    }

    // Teacher/Admin only
    [Authorize(Roles = "Teacher,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetEnrollmentInCourse(string courseId)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            var enrollments = await _enrollmentCourseService.GetEnrollmentInCourseAsync(userId, courseId);
            return Ok(new APIResponse("Success", "Enrollments retrieve successfully", enrollments));
        }
        catch (KeyNotFoundException knfE)
        {
            return NotFound(new APIResponse("Error", knfE.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieve ennrollments", ex.Message));
        }
    }

    // Student only
    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> CreateEnrollmentAsync(string courseId)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            await _enrollmentCourseService.CreateEnrollmentAsync(courseId, studentId);
            return Ok(new APIResponse("Success", "Enrollment create successfully"));
        }
        catch (KeyNotFoundException knfE)
        {
            return NotFound(new APIResponse("Error", knfE.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating the enrollment", ex.Message));
        }
    }

    // Student/Admin/Teacher only
    [Authorize(Roles = "Student,Teacher,Admin")]
    [HttpGet("{enrollmentId}")]
    public async Task<IActionResult> GetEnrollmentByIdAsync(string courseId, string enrollmentId)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            var enrollment = await _enrollmentCourseService.GetEnrollmentByIdAsync(userId, courseId, enrollmentId);
            return Ok(new APIResponse("Success", "Retrieve Enrollment Successfully", enrollment));
        }
        catch (KeyNotFoundException knfE)
        {
            return NotFound(new APIResponse("Error", knfE.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the enrollment", ex.Message));
        }
    }

    // Student only
    [Authorize(Roles = "Student")]
    [HttpPatch("progress")]
    public async Task<IActionResult> UpdateProgressEnrollmentAsync(string courseId, [FromBody] EnrollmentProgressUpdateDTO enrollmentUpdateDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            await _enrollmentCourseService.UpdateProgressEnrollmentAsync(studentId, courseId, enrollmentUpdateDTO);
            return Ok(new APIResponse("Success", "Update Progress Enrollment Successfully"));
        }
        catch (KeyNotFoundException knfE)
        {
            return NotFound(new APIResponse("Error", knfE.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating progress the enrollment", ex.Message));
        }
    }

    // Student only
    [Authorize(Roles = "Student")]
    [HttpPost("{enrollmentId}/request-cancel")]
    public async Task<IActionResult> RequestCancelEnrollmentAsync(string courseId, string enrollmentId, [FromBody] RequestCancelEnrollmentDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _enrollmentCourseService.RequestCancelEnrollmentAsync(userId, courseId, enrollmentId, dto);
            return Ok(new APIResponse("Success", "Request Refund Course create Successfully"));
        }
        catch (KeyNotFoundException knfE)
        {
            return NotFound(new APIResponse("Error", knfE.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while create Request Refund Course", ex.Message));
        }
    }

    [Authorize(Roles = "Student,Teacher")]
    [HttpGet("is-enrolled")]
    public async Task<IActionResult> IsEnrolledInCourseAsync(string courseId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var isEnrolled = await _enrollmentCourseService.IsEnrolledInCourseAsync(studentId, courseId);
            return Ok(new APIResponse("Success", "Check enrollment successfully", new { IsEnrolled = isEnrolled }));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while checking enrollment", ex.Message));
        }
    }
}