using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[Route("api/exam-attempt")]
[ApiController]
public class ExamAttemptController : ControllerBase
{
    private readonly IExamAttempService _examAttempService;
    public ExamAttemptController(IExamAttempService examAttempService)
    {
        _examAttempService = examAttempService;
    }

    [HttpPatch("{attemptId}/save-answers")]
    public async Task<IActionResult> SaveExamAnswers(string attemptId, [FromBody] string currentAnswers)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            await _examAttempService.SaveExamAnswersAsync(studentId, attemptId, currentAnswers);
            return Ok(new APIResponse("success", "Save answers successfully"));
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
            APIResponse("error", "An error occurred while saving exam answers", ex.Message));
        }
    }

    [HttpGet("{attemptId}/fetch-saved-answers")]
    public async Task<IActionResult> FetchSavedAnswers(string attemptId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var examAttemp = await _examAttempService.GetExamAttempByIdAsync(studentId, attemptId);
            return Ok(new APIResponse("success", "Fetch saved answers successfully", examAttemp));
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
            APIResponse("error", "An error occurred while fetching saved answers", ex.Message));
        }
    }

    [HttpGet("{attemptId}/attempt")]
    public async Task<IActionResult> GetExamAttemptById(string attemptId)
    {
        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            var examAttemp = await _examAttempService.GetExamAttempByIdAsync(studentId, attemptId);
            return Ok(new APIResponse("success", "Fetch exam attempt successfully", examAttemp));
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
            APIResponse("error", "An error occurred while fetching exam attempt", ex.Message));
        }
    }
}