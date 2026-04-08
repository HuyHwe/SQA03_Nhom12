using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models;

public class Enrollment_course
{
    [Key]
    public string Id { get; set; } = null!;

    [Required]
    public string StudentId { get; set; } = null!;

    [Required]
    public string CourseId { get; set; } = null!;

    public DateTime EnrolledAt { get; set; }
    [Column(TypeName = "decimal(5,2)")]
    public decimal Progress { get; set; } = 0.00m;
    public string Status { get; set; } = "active";
    public string? CertificateUrl { get; set; }

    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;

    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;

    public ICollection<RefundRequestCourse> RefundRequestCourses { get; set; } = new List<RefundRequestCourse>();

}
