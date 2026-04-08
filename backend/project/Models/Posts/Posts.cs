using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Posts;

public class Post
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string AuthorId { get; set; } = null!;

    [ForeignKey(nameof(AuthorId))]
    public Student Student { get; set; } = null!; // Navigation đến Student

    [Required, MaxLength(200)]
    public string? Title { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? ContentJson { get; set; }

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    [MaxLength(300)]
    public string? Tags { get; set; }

    public int ViewCount { get; set; } = 0;
    public int LikeCount { get; set; } = 0;
    public int DiscussionCount { get; set; } = 0;

    public bool IsPublished { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

     // Soft delete fields
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

}
