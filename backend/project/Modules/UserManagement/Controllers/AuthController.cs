using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using project.Models;
using project.Modules.UserManagement.DTOs;
using project.Modules.UserManagement.Services;
using project.Modules.UserManagement.Services.Interfaces;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [Authorize(Roles = "Teacher")]
    [HttpGet("test")]
    public ActionResult<string> Test()
    {
        return "AuthController is working!";
    }

    [Authorize]
    [HttpGet("claims")]
    public IActionResult GetClaims()
    {
        // Lấy tất cả claims của user hiện tại
        var claims = User.Claims.Select(c => new
        {
            c.Type,
            c.Value
        }).ToList();

        return Ok(claims);
    }


    [HttpPost("register-teacher")]
    [Authorize] // chỉ cho user đã login
    public async Task<ActionResult> RegisterTeacher([FromBody] TeacherRegisterDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not found in token");

        try
        {
            var teacher = await _authService.RegisterTeacherAsync(userId, dto);
            return Ok(new
            {
                teacher.TeacherId,
                teacher.UserId,
                teacher.EmployeeCode,
                teacher.instruction
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }


    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        try
        {
            // Chú ý: service sẽ kiểm tra hash token, hết hạn, và sinh token mới
            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh-admin-token")]
    public async Task<ActionResult<AuthAdminResponseDTO>> RefreshAdminToken([FromBody] RefreshTokenDto dto)
    {
        try
        {
            // Chú ý: service sẽ kiểm tra hash token, hết hạn, và sinh token mới
            var result = await _authService.RefreshAdminTokenAsync(dto.RefreshToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register-admin")]
    public async Task<ActionResult> RegisterAdmin([FromBody] AdminRegisterDTO dto)
    {
        try
        {
            var admin = await _authService.RegisterAdminAsync(dto);
            return Ok(new
            {
                admin.AdminId,
                admin.UserId,
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("admin-login")]
    public async Task<ActionResult<AuthAdminResponseDTO>> AdminLogin([FromBody] LoginAdminDTO dto)
    {
        try
        {
            var result = await _authService.AdminLoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}