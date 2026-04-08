using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class SubmitController : ControllerBase
{
    private readonly ISubmissionExamService _submissionExamService;
    private readonly ISubmissionAnswerService _submissionAnswerService;

    public SubmitController(
        ISubmissionExamService submissionExamService,
        ISubmissionAnswerService submissionAnswerService
    )
    {
        _submissionExamService = submissionExamService;
        _submissionAnswerService = submissionAnswerService;
    }

    // API go here
    [HttpPost("{attemptId}/submit-exam")]
    public async Task<IActionResult> SubmitExam(string attemptId, [FromBody] string lastAnswers)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var studentId = User.FindFirst("studentId")?.Value;
            await _submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, lastAnswers);
            return Ok(new APIResponse("Success", "Submit exam successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new APIResponse("Not Found", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new APIResponse("Invalid Operation", ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new APIResponse("Internal Server Error", ex.Message));
        }

    }
}