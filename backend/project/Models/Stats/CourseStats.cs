using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models.Stats;

public class CourseStats
{
    [Key]
    [ForeignKey(nameof(Course))] // 1-1 với Course
    public string CourseId { get; set; } = null!;

    public int TotalEnrollment { get; set; } = 0;

    public int TotalReview { get; set; } = 0;

    [Range(0, 5)]
    public double AverageRating { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation property
    public Course Course { get; set; } = null!;

}
