using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace project.Models
{
    public class User : IdentityUser
    {
        [Required]
        [MaxLength(100)] 
        public string FullName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [MaxLength(500)]
        public string? SocialLinks { get; set; }  // Đổi thành PascalCase

        [MaxLength(50)]
        public string? Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeleteAt { get; set; }

        public string? RefreshTokenHash { get; set; }
        public DateTime? RefreshTokenTimeExpire { get; set; } // thêm property này

        // Navigation 1-1
        public Teacher? Teacher { get; set; }
        public Student? Student { get; set; }
        public Admin? Admin { get; set; }
    }
}
