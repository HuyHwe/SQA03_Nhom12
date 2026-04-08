using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Stats;

public class StudentStats
{
    [Key]
    [ForeignKey(nameof(Student))] // 1-1 với Member
    public string? StudentId { get; set; }

    public int PostCount { get; set; } = 0;

    public int DiscussionCount { get; set; } = 0;

    public int QuestionCount { get; set; } = 0;

    public int ContributePoint { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation
    public Student Student { get; set; } = null!;

}
