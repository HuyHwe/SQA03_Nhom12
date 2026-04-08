using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Posts;

public class Discussion
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string? StudentId { get; set; }

    [MaxLength(50)]
    public string? TargetType { get; set; } 

    public string? TargetTypeId { get; set; }

    [Required]
    public string? Content { get; set; }

    public string? ParentDiscussionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;

    [ForeignKey(nameof(ParentDiscussionId))]
    public Discussion? ParentDiscussion { get; set; }

    public ICollection<Discussion> Replies { get; set; } = new List<Discussion>();
}
