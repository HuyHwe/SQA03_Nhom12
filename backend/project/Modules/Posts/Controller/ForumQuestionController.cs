using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Services.Interfaces;

namespace project.Modules.Posts.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumQuestionController : ControllerBase
    {
        private readonly IForumQuestionService _forumService;


        public ForumQuestionController(IForumQuestionService forumService)
        {
            _forumService = forumService;

        }
        /// GET /api/forum/questions
        /// Lấy danh sách câu hỏi
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ForumQuestionDto>>> GetAllQuestions()
        {
            var questions = await _forumService.GetAllQuestionsAsync();
            return Ok(questions);
        }


        /// <summary>
        /// Lấy danh sách câu hỏi có phân trang + tìm theo tags
        /// /api/forumquestion/paged?page=1&pageSize=10&tags=csharp&tags=backend
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            int page = 1,
            int pageSize = 10,
            [FromQuery] List<string>? tags = null
        )
        {
            var (items, totalRecords) =
                await _forumService.GetAllQuestionsPagedAsync(page, pageSize, tags);

            return Ok(new
            {
                items,
                totalRecords,
                page,
                pageSize
            });
        }

        /// <summary>
        /// GET /api/forum/questions/{id}
        /// Lấy chi tiết câu hỏi
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ForumQuestionDetailDto>> GetQuestionById(string id)
        {
            var question = await _forumService.GetQuestionByIdAsync(id);
            if (question == null)
                return NotFound(new { Message = "Question not found" });

            return Ok(question);
        }



        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetByMember(string memberId)
        {
            var result = await _forumService.GetQuestionsByStudentAsync(memberId);
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(ForumQuestionCreateDto dto)
        {

            var studentId = User.FindFirst("StudentId")?.Value;
            if (studentId == null) return Unauthorized();

            var id = await _forumService.CreateAsync(studentId, dto);
            return Ok(new { id });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, ForumQuestionUpdateDto dto)
        {
            var studentId = User.FindFirst("StudentId")?.Value;
            if (studentId == null) return Unauthorized();

            try
            {
                var ok = await _forumService.UpdateAsync(id, studentId, dto);
                return ok ? Ok() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        // DELETE (soft): /api/forum/questions/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(string id)
        {
            var studentId = User.FindFirst("StudentId")?.Value;
            if (studentId == null) return Unauthorized();

            try
            {
                var ok = await _forumService.SoftDeleteAsync(id, studentId);
                return ok ? Ok() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        // POST: /api/forum/questions/{id}/restore
        [Authorize]
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(string id)
        {
            var studentId = User.FindFirst("StudentId")?.Value;
            if (studentId == null) return Unauthorized();

            try
            {
                var ok = await _forumService.RestoreAsync(id, studentId);
                return ok ? Ok() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        // DELETE (hard): /api/forum/questions/{id}/hard
        [Authorize]
        [HttpDelete("{id}/hard")]
        public async Task<IActionResult> HardDelete(string id)
        {
            var isAdmin = User.IsInRole("Admin");
            var studentId = User.FindFirst("StudentId")?.Value;
            if (!isAdmin && studentId == null) return Unauthorized();

            try
            {
                var ok = await _forumService.HardDeleteAsync(id, studentId, isAdmin);
                return ok ? Ok() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }


        [Authorize]
        [HttpGet("listForumdeleted")]
        public async Task<IActionResult> GetDeletedMyQuestions()
        {
            var studentId = User.FindFirst("StudentId")?.Value;
            if (studentId == null) return Unauthorized();

            var result = await _forumService.GetDeletedQuestionsAsync(studentId);
            return Ok(result);
        }

        /// <summary>
        /// Tăng view count cho câu hỏi
        /// POST /api/forumquestion/{id}/view
        /// </summary>
        [HttpPost("{id}/view")]
        public async Task<IActionResult> IncreaseView(string id)
        {
            var ok = await _forumService.IncreaseViewCountAsync(id);
            if (!ok)
                return NotFound(new { message = "Question not found" });

            return Ok(new { message = "View count increased" });
        }



    }
}
