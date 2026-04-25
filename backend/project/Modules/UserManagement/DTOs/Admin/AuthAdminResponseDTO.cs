using System;
using System.Collections.Generic;

public class AuthAdminResponseDTO
{
    public string Token { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? RefreshToken { get; set; }

    public string? AdminId { get; set; }
    public List<string> Roles { get; set; } = new();
}