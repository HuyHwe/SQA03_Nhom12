using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using project.Models;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscussionController : ControllerBase
    {
        private readonly IDiscussionService _discussionService;

        public DiscussionController(IDiscussionService discussionService)
        {
            _discussionService = discussionService;
        }

        private string GetStudentId()
        {
            return User.FindFirst("StudentId")?.Value ?? throw new Exception("Không tìm thấy StudentId");
        }



        // ✅ GET /api/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiscussionDto>>> GetAllComments()
        {
            var comments = await _discussionService.GetAllCommentsAsync();

            if (!comments.Any())
                return NotFound(new { message = "Không có bình luận nào trong hệ thống." });

            return Ok(comments);
        }

        // GET /api/discussions/{targetType}/{targetId}
        [HttpGet("{targetType}/{targetId}")]
        public async Task<ActionResult<IEnumerable<DiscussionDto>>> GetCommentsByTarget(string targetType, string targetId)
        {
            // targetType : Post, ForumQuestion, Course, Discussion
            var comments = await _discussionService.GetCommentsByTargetAsync(targetType, targetId);
            return Ok(comments);
        }
        

        [Authorize]
        [HttpPost("{targetType}/{targetTypeId}")]
        public async Task<IActionResult> CreateDiscussion(
      string targetType,
      string targetTypeId,
      [FromQuery] string? parentDiscussionId,
      [FromBody] CreateDiscussionRequest dto)
        {
            try
            {
                // targetType và targetTypeId lấy từ route
                var discussion = await _discussionService.CreateAsync(
                    GetStudentId(),
                    dto.Content,
                    targetType,
                    targetTypeId,
                    parentDiscussionId
                );

                return Ok(discussion); // DiscussionDto
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{discussionId}")]
        public async Task<IActionResult> UpdateDiscussion(string discussionId, [FromBody] UpdateDiscussionRequest dto)
        {
            try
            {
                var discussion = await _discussionService.UpdateAsync(GetStudentId(), discussionId, dto);
                return Ok(discussion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        
        [Authorize]
        [HttpDelete("{discussionId}")]
        public async Task<IActionResult> DeleteDiscussion(string discussionId)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");
                var studentId = User.FindFirst("StudentId")?.Value;

                if (!isAdmin && string.IsNullOrEmpty(studentId))
                    return Unauthorized("Không tìm thấy StudentId");

                await _discussionService.DeleteAsync(studentId, discussionId, isAdmin);
                return Ok(new { message = "Xóa Discussion thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }






    }
}
