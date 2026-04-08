using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Posts;

public class Likes
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string StudentId { get; set; } = null!;

    [MaxLength(50)]
    public string? TargetType { get; set; } // Ví dụ: "Discussion", "Post", "Lesson"

    public string? TargetId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;

}


