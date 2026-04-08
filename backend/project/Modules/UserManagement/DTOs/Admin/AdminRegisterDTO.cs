using System.ComponentModel.DataAnnotations;

namespace project.Modules.UserManagement.DTOs
{
    public class AdminRegisterDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [Required]
        public string FullName { get; set; } = null!;
    }
}