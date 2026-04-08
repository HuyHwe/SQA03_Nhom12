using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace project.Models;

public class Admin
{
    [Key]
    public string AdminId { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string UserId { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<UpdateRequestCourse> ReviewedRequests { get; set; } = new List<UpdateRequestCourse>();
    public ICollection<RefundRequestCourse> RefundRequestCourses { get; set; } = new List<RefundRequestCourse>();
    public ICollection<AdminReviewCourse> AdminReviewCourses { get; set; } = new List<AdminReviewCourse>();
    public ICollection<AdminReviewLesson> AdminReviewLessons { get; set; } = new List<AdminReviewLesson>();
}
