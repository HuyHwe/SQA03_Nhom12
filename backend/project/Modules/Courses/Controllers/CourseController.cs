using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

[Route("api/courses")]
[ApiController]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly IRequestUpdateService _requestUpdateService;

    public CourseController(
        ICourseService courseService,
        IRequestUpdateService requestUpdateService)
    {
        _courseService = courseService;
        _requestUpdateService = requestUpdateService;
    }

    // All users
    [HttpGet]
    public async Task<IActionResult> GetAllCourses()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return Ok(new APIResponse("Success", "Retrieve Courses Successfully", courses));
    }

    // All users
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(string id)
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            var course = await _courseService.GetCourseByIdAsync(teacherId, id);
            return Ok(new APIResponse("Success", "Retrieve Course Successfully", course));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the course", ex.Message));
        }
    }

    // All users
    [HttpGet("search")]
    public async Task<IActionResult> SearchItems(
        [FromQuery] string? keyword,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
        )
    {
        try
        {
            var courses = await _courseService.SearchItemsAsync(keyword, category, page, pageSize);
            return Ok(new APIResponse("Success", "Retrieve Course Successfully", courses));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the course", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CourseCreateDTO courseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _courseService.AddCourseAsync(teacherId, courseDto);
            return Ok(new APIResponse("Success", "Create new Course successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while creating the course.",
                detail = ex.Message
            });
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost("create-full-course")]
    public async Task<IActionResult> CreateFullCourse([FromBody] FullCourseCreateDTO fullCourseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _courseService.AddFullCourseAsync(teacherId, fullCourseDto);
            return Ok(new APIResponse("Success", "Create new Full Course successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while creating the full course.",
                detail = ex.Message
            });
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPut("{courseId}/update-full-course")]
    public async Task<IActionResult> UpdateFullCourse(string courseId, [FromBody] FullCourseUpdateDTO fullCourseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _courseService.UpdateFullCourseAsync(teacherId, courseId, fullCourseDto);
            return Ok(new APIResponse("Success", "Update Full Course successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while updating the full course.",
                detail = ex.Message
            });
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateCourse(string id, [FromBody] CourseUpdateDTO courseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _courseService.UpdateCourseAsync(teacherId, id, courseDto);
            return Ok(new APIResponse("success", "Update course successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while updating the course", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPatch("{id}/request-publish")]
    public async Task<IActionResult> RequestPublishCourse(string id)
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _courseService.RequestPublishCourseAsync(teacherId, id);
            return Ok(new APIResponse("success", "Course requested publish successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while publishing the course", ex.Message));
        }
    }

    // Teacher only
    [Authorize(Roles = "Teacher")]
    [HttpPost("{id}/request-update")]
    public async Task<IActionResult> RequestUpdateCourse([FromBody] RequestUpdateRequestDTO requestDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _requestUpdateService.CreateRequestUpdateAsync(teacherId, requestDto);
            return Ok(new APIResponse("success", "Course update request created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new APIResponse("error", "An error occurred while creating the update request", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("instructor")]
    public async Task<IActionResult> GetInstructorCourses(
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            var courses = await _courseService.GetCoursesByTeacherIdAsync(teacherId, keyword, status, sort, page, pageSize);
            return Ok(new APIResponse("Success", "Retrieve My Courses Successfully", courses));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the courses", ex.Message));
        }
    }

    [HttpGet("teacher/{teacherId}/courses")]
    public async Task<IActionResult> GetCoursesByTeacherId(
        string teacherId,
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var courses = await _courseService.GetCoursesByTeacherIdAsync(teacherId, keyword, status, sort, page, pageSize);
            return Ok(new APIResponse("Success", "Retrieve Courses by TeacherId Successfully", courses));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the courses", ex.Message));
        }
    }

    [Authorize(Roles = "Student")]
    [HttpGet("student/enrolled-courses")]
    public async Task<IActionResult> GetEnrolledCourses(
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var courses = await _courseService.GetEnrolledCoursesByStudentIdAsync(studentId, keyword, status, sort, page, pageSize);
            return Ok(new APIResponse("Success", "Retrieve Enrolled Courses Successfully", courses));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the courses", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("{courseId}/full-data-edit")]
    public async Task<IActionResult> GetFullCourseDataForEdit(string courseId)
    {
        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            var fullCourseData = await _courseService.GetFullCourseDataForEditAsync(teacherId, courseId);
            return Ok(new APIResponse("Success", "Retrieve Full Course Data for Edit Successfully", fullCourseData));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the full course data", ex.Message));
        }
    }
}
