using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/exams")]
[ApiController]
public class ExamController : ControllerBase
{
    private readonly IExamService _examService;
    private readonly IExamAttempService _examAttempService;
    private readonly ISubmissionExamService _submissionExamService;
    public ExamController(
        IExamService examService,
        IExamAttempService examAttempService,
        ISubmissionExamService submissionExamService)
    {
        _examService = examService;
        _examAttempService = examAttempService;
        _submissionExamService = submissionExamService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllExam()
    {
        var listExams = await _examService.GetAllExamsAsync();
        return Ok(listExams);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExamById(string id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var exam = await _examService.GetExamByIdAsync(userId, id);
            return Ok(new APIResponse("success", "Retrieve Exam Successfully", exam));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the Exam", ex.Message));
        }
    }

    // [Authorize(Roles = "Teacher")]
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAllExamsForTeacher(
        string courseId,
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
            var exams = await _examService.GetExamsByCourseIdAsync(teacherId, courseId, keyword, status, sort, page, pageSize);
            return Ok(new APIResponse("success", "Retrieve All Exams for Teacher Successfully", exams));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving all Exams for Teacher", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateNewExam([FromBody] CreateExamDTO exam)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _examService.AddExamAsync(userId, exam);
            return Ok(new APIResponse("Success", "Create new Exam successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating the exam", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost("create-full-exam")]
    public async Task<IActionResult> CreateFullExam([FromBody] CreateFullExamDTO exam)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var teacherId = User.FindFirst("TeacherId")?.Value;
            await _examService.AddFullExamAsync(teacherId, exam);
            return Ok(new APIResponse("Success", "Create full Exam successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while creating the full exam", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateExam(string id, [FromBody] UpdateExamDTO exam)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }

        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _examService.UpdateExamAsync(userId, id, exam);
            return Ok(new APIResponse("Success", "Update exam successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating the exam", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost("{id}/order")]
    public async Task<IActionResult> UpdateOrderQuestionInExam(string id, [FromBody] List<QuestionExamOrderDTO> questionOrders)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("error", "Invalid input data", ModelState));
        }
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _examService.UpdateOrderQuestionInExamAsync(userId, id, questionOrders);
            return Ok(new APIResponse("success", "Update question order successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while updating question order", ex.Message));
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetExamsInCourseAsync(string courseId)
    {
        try
        {
            var exams = await _examService.GetExamsInCourseAsync(courseId);
            return Ok(new APIResponse("success", "Retrieve Exams in course Successfully", exams));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while Retrieve Exams", ex.Message));
        }
    }

    [HttpGet("lesson/{lessonId}")]
    public async Task<IActionResult> GetExamsInLessonAsync(string lessonId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var exams = await _examService.GetExamsInLessonAsync(studentId, lessonId);
            return Ok(new APIResponse("success", "Retrieve Exams in lesson Successfully", exams));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while Retrieve Exams", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost("{examId}/upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadExamExcel([FromForm] UploadExamExcelRequest request)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _examService.UploadExamExcelAsync(userId, request);
            return Ok(new APIResponse("success", "Upload exam excel successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while uploading exam excel", ex.Message));
        }
    }

    [Authorize(Roles = "Student")]
    [HttpPost("{examId}/attempt/start")]
    public async Task<IActionResult> StartExamAttempt(string examId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            // Call the service to start the exam attempt
            var attempExam = await _examAttempService.AddExamAttempAsync(studentId, examId);
            return Ok(new APIResponse("success", "Exam attempt started successfully", attempExam));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("error", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while starting the exam attempt", ex.Message));
        }
    }

    [Authorize]
    [HttpGet("{examId}/history")]
    public async Task<IActionResult> GetExamAttemptHistory(string examId)
    {
        try
        {
            var userId = User.FindFirst("studentId")?.Value ?? User.FindFirst("userId")?.Value;
            var examAttempts = await _submissionExamService.GetSubmissionHistoryByStudentAndExamAsync(userId, examId);
            return Ok(new APIResponse("success", "Retrieve Exam Attempt History Successfully", examAttempts));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the exam attempt history", ex.Message));
        }
    }

    [Authorize]
    [HttpGet("{attemptId}/detail-submission")]
    public async Task<IActionResult> GetDetailSubmissionExamAttemptAsync(string attemptId)
    {
        try
        {
            var userId = User.FindFirst("studentId")?.Value ?? User.FindFirst("userId")?.Value;
            var detailSubmission = await _submissionExamService.GetSubmissionExamDetailDTOAsync(userId, attemptId);
            return Ok(new APIResponse("success", "Retrieve Detail Submission Successfully", detailSubmission));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the detail submission", ex.Message));
        }
    }

    [Authorize]
    [HttpGet("submission-exam/{submissionExamId}/user-submission-result")]
    public async Task<IActionResult> GetUserSubmissionResultAsync(string submissionExamId)
    {
        try
        {
            var userId = User.FindFirst("studentId")?.Value ?? User.FindFirst("userId")?.Value;
            var result = await _submissionExamService.GetUserSubmissionResultAsync(userId, submissionExamId);
            return Ok(new APIResponse("success", "Retrieve User Submission Result Successfully", result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while retrieving the user submission result", ex.Message));
        }
    }
}