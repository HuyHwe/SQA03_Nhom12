using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using project.Models;
using project.Modules.UserManagement.DTOs;
using project.Modules.UserManagement.Services.Interfaces;

namespace project.Modules.UserManagement.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    private readonly DBContext _context;

    public AuthService(UserManager<User> userManager, IConfiguration configuration, DBContext context)
    {
        _userManager = userManager;
        _configuration = configuration;
        _context = context;
    }

    // Register
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            UserName = dto.Email,       // Identity cần UserName
            Email = dto.Email,
            FullName = dto.FullName,

            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            AvatarUrl = dto.AvatarUrl,
            SocialLinks = dto.SocialLinks,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // Tạo user với password
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        // Gán role mặc định là Student (nếu dùng roles)
        await _userManager.AddToRoleAsync(user, "Student");

        // Tạo record Student tương ứng trong bảng Student
        var student = new Student
        {
            UserId = user.Id,
            StudentId = Guid.NewGuid().ToString(),
            Bio = ""
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        // Refresh token
        var refreshToken = GenerateRefreshToken();
        user.RefreshTokenHash = HashToken(refreshToken);
        user.RefreshTokenTimeExpire = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        // Kiểm tra xem user có phải teacher không (mới đăng ký thì thường chưa)
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);

        // Tạo JWT
        var token = GenerateJwtToken(user, student.StudentId, teacher?.TeacherId);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            StudentId = student.StudentId,
            TeacherId = teacher?.TeacherId
        };
    }


    // Login
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            throw new Exception("Email hoặc mật khẩu không đúng");

        var valid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!valid)
            throw new Exception("Email hoặc mật khẩu không đúng");

        // Lấy StudentId tương ứng với UserId
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id) ?? throw new Exception("Student not found");

        // Lấy TeacherId nếu có
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);

        var refreshToken = GenerateRefreshToken();
        user.RefreshTokenHash = HashToken(refreshToken);
        user.RefreshTokenTimeExpire = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        var token = GenerateJwtToken(user, student.StudentId, teacher?.TeacherId);
        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            RefreshToken = refreshToken,
            StudentId = student?.StudentId,
            TeacherId = teacher?.TeacherId
        };
    }

    // Đăng ký làm teacher
    public async Task<Teacher> RegisterTeacherAsync(string userId, TeacherRegisterDto dto)
    {
        // Lấy user
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        // Kiểm tra user đã là teacher chưa
        var existingTeacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == userId);
        if (existingTeacher != null)
            throw new Exception("User is already a teacher");

        // Tạo hồ sơ Teacher
        var teacher = new Teacher
        {
            UserId = userId,
            EmployeeCode = dto.EmployeeCode?.ToUpper()
                            ?? Guid.NewGuid().ToString().Substring(0, 6).ToUpper(),
            instruction = dto.Instruction ?? ""
        };

        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // ✅ Thêm role Teacher vào (KHÔNG xoá role Student)
        if (!await _userManager.IsInRoleAsync(user, "Teacher"))
            await _userManager.AddToRoleAsync(user, "Teacher");

        // Cập nhật thời gian
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return teacher;
    }

    public async Task<Admin> RegisterAdminAsync(AdminRegisterDTO dto)
    {
        // Kiểm tra nếu email đã tồn tại
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new Exception("Email is already registered");

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, "Admin");

        var admin = new Admin
        {
            UserId = user.Id,
            AdminId = Guid.NewGuid().ToString(),
        };

        _context.Admins.Add(admin);
        await _context.SaveChangesAsync();

        return admin;
    }

    // Login Admin
    public async Task<AuthAdminResponseDTO> AdminLoginAsync(LoginAdminDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            throw new Exception("Email hoặc mật khẩu không đúng");

        var valid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!valid)
            throw new Exception("Email hoặc mật khẩu không đúng");

        var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id) ?? throw new Exception("Admin not found");

        var token = GenerateAdminJwtToken(user, admin.AdminId);
        var refreshToken = GenerateRefreshToken();
        user.RefreshTokenHash = HashToken(refreshToken);
        user.RefreshTokenTimeExpire = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthAdminResponseDTO
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            RefreshToken = refreshToken,
            AdminId = admin.AdminId
        };
    }

    private string GenerateAdminJwtToken(User user, string adminId)
    {
        // Lấy roles của user
        var roles = _userManager.GetRolesAsync(user).Result;
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim("AdminId", adminId)
        };

        //Thêm claim role
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        claims.AddRange(roles.Select(r =>
            new Claim("role", r) // frontend decode
        ));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddHours(6),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AuthAdminResponseDTO> RefreshAdminTokenAsync(string refreshToken)
    {
        var hashedToken = HashToken(refreshToken);
        var user = await _userManager.Users.FirstOrDefaultAsync(u =>
            u.RefreshTokenHash == hashedToken &&
            u.RefreshTokenTimeExpire != null &&
            u.RefreshTokenTimeExpire > DateTime.UtcNow);

        if (user == null)
            throw new Exception("Invalid or expired refresh token");

        var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id);
        if (admin == null)
            throw new Exception("Admin not found");

        // Tạo access token mới
        var newToken = GenerateAdminJwtToken(user, admin.AdminId);
        // Tạo refresh token mới
        var newRefreshToken = GenerateRefreshToken();
        user.RefreshTokenHash = HashToken(newRefreshToken);
        user.RefreshTokenTimeExpire = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthAdminResponseDTO
        {
            Token = newToken,
            UserId = user.Id,
            FullName = user.FullName,
            RefreshToken = newRefreshToken,
            AdminId = admin.AdminId
        };
    }

    // ========================= Refresh Token =========================
    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var hashedToken = HashToken(refreshToken);
        var user = await _userManager.Users.FirstOrDefaultAsync(u =>
            u.RefreshTokenHash == hashedToken &&
            u.RefreshTokenTimeExpire != null &&
            u.RefreshTokenTimeExpire > DateTime.UtcNow);

        if (user == null)
            throw new Exception("Invalid or expired refresh token");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);

        // Tạo access token mới
        var newToken = GenerateJwtToken(user, student?.StudentId ?? "", teacher?.TeacherId);

        // Tạo refresh token mới
        var newRefreshToken = GenerateRefreshToken();
        user.RefreshTokenHash = HashToken(newRefreshToken);
        user.RefreshTokenTimeExpire = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            Token = newToken,
            UserId = user.Id,
            FullName = user.FullName,
            RefreshToken = newRefreshToken,
            StudentId = student?.StudentId,
            TeacherId = teacher?.TeacherId
        };
    }


    // ========================= Helper =========================
    private string GenerateJwtToken(User user, string studentId, string? teacherId)
    {
        // Lấy roles của user
        var roles = _userManager.GetRolesAsync(user).Result;
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim("StudentId", studentId)
        };

        if (!string.IsNullOrEmpty(teacherId))
            claims.Add(new Claim("TeacherId", teacherId));

        //Thêm claim role
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        claims.AddRange(roles.Select(r =>
            new Claim("role", r) // frontend decode
        ));


        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddHours(6),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private string HashToken(string token)
    {
        return Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }


}
