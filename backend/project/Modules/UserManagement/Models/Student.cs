using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models.Posts;
using project.Models.Stats;

namespace project.Models;

public class Student
{
    [Key]
    public string StudentId { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string UserId { get; set; } = null!;
    public string? Bio { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    // Navigation: 
    public ICollection<Enrollment_course> Enrollments { get; set; } = new List<Enrollment_course>();
    public ICollection<CourseReview> Reviews { get; set; } = new List<CourseReview>();
    public ICollection<Orders> Orders { get; set; } = new List<Orders>();
    public ICollection<SubmissionExam> SubmissionExams { get; set; } = new List<SubmissionExam>();
    public ICollection<ExamAttemp> ExamAttemps { get; set; } = new List<ExamAttemp>();

    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
    public ICollection<Likes> Likes { get; set; } = new List<Likes>();
    public ICollection<Reports> Reports { get; set; } = new List<Reports>();

    // Thêm quan hệ 1–1 với MemberStats
    public StudentStats? StudentStats { get; set; }


    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<ForumQuestion> ForumQuestions { get; set; } = new List<ForumQuestion>();
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<RefundRequestCourse> RefundRequestCourses { get; set; } = new List<RefundRequestCourse>();
}
