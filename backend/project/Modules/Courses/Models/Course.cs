using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using project.Models.Stats;

namespace project.Models;

public class Course
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(255)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    // FK -> Category
    [Required]
    public string CategoryId { get; set; } = null!;

    // FK -> Teacher
    [Required]
    public string TeacherId { get; set; } = null!;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [Column("DiscountPrice", TypeName = "decimal(10,2)")]
    public decimal? DiscountPrice { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = null!; // ""draft", "pending", "published", "rejected"

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    // Navigation
    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    [ForeignKey(nameof(TeacherId))]
    public Teacher Teacher { get; set; } = null!;


    // Naviagtion
    public ICollection<Enrollment_course> Enrollments { get; set; } = new List<Enrollment_course>();
    public CourseContent Content { get; set; } = null!;
    public ICollection<CourseReview> Reviews { get; set; } = new List<CourseReview>();

    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public ICollection<AdminReviewLesson> AdminReviewLessons { get; set; } = new List<AdminReviewLesson>();

    // Thêm liên kết 1–1
    public CourseStats? CourseStats { get; set; }
    public AdminReviewCourse? AdminReviewCourse { get; set; }

}
