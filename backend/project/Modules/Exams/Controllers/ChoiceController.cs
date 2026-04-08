using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/{questionExamId}/choices")]
[ApiController]
public class ChoiceController : ControllerBase
{
    private readonly IChoiceService _choiceService;

    public ChoiceController(IChoiceService choiceService)
    {
        _choiceService = choiceService;
    }

    // Controller actions go here
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> AddChoice(string questionExamId, [FromBody] AddChoiceDTO addChoiceDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new APIResponse("Error", "Invalid input data", ModelState));
        }
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _choiceService.AddChoiceAsync(userId, questionExamId, addChoiceDTO);
            return Ok(new APIResponse("Success", "Add choice successfully."));
        }
        catch (ArgumentException argEx)
        {
            return BadRequest(new APIResponse("Error", argEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while adding the choice", ex.Message));
        }

    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{choiceId}")]
    public async Task<IActionResult> DeleteChoice(string choiceId)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _choiceService.DeleteChoiceByIdAsync(userId, choiceId);
            return Ok(new APIResponse("Success", "Delete choice successfully."));
        }
        catch (KeyNotFoundException knfEx)
        {
            return NotFound(new APIResponse("Error", knfEx.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while deleting the choice", ex.Message));
        }
    }

    [Authorize(Roles = "Teacher")]
    [HttpPatch("{choiceId}")]
    public async Task<IActionResult> UpdateChoiceContent(string choiceId, [FromBody] ChoiceUpdateDTO dto)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            await _choiceService.UpdateChoiceAsync(userId, choiceId, dto);
            return Ok(new APIResponse("success", "Update choice Successfully!"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            APIResponse("error", "An error occurred while update choice", ex.Message));
        }
    }
}