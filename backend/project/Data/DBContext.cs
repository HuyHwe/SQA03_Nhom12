using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using project.Models;
using project.Models.Order;
using project.Models.Posts;
using project.Models.Stats;

public class DBContext : IdentityDbContext<User>
{
    public DBContext(DbContextOptions<DBContext> options) : base(options)
    {
    }

    public DbSet<User> User { get; set; } = null!;
    public DbSet<Student> Students { get; set; } = null!;
    public DbSet<Teacher> Teachers { get; set; } = null!;
    public DbSet<Admin> Admins { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Course> Courses { get; set; } = null!;
    public DbSet<UpdateRequestCourse> UpdateRequestCourses { get; set; } = null!;
    public DbSet<CourseContent> CourseContents { get; set; } = null!;
    public DbSet<Lesson> Lessons { get; set; } = null!;
    public DbSet<LessonProgress> LessonProgresses { get; set; } = null!;
    public DbSet<Enrollment_course> Enrollments { get; set; } = null!;
    public DbSet<RefundRequestCourse> RefundRequestCourses { get; set; } = null!;
    public DbSet<Material> Materials { get; set; } = null!;
    public DbSet<CourseReview> CourseReviews { get; set; } = null!;
    public DbSet<Orders> Orders { get; set; } = null!;
    public DbSet<OrderDetail> OrderDetails { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Exam> Exams { get; set; } = null!;
    public DbSet<QuestionExam> QuestionExams { get; set; } = null!;
    public DbSet<Choice> Choices { get; set; } = null!;
    public DbSet<SubmissionExam> SubmissionExams { get; set; } = null!;
    public DbSet<SubmissionAnswer> SubmissionAnswers { get; set; } = null!;
    public DbSet<ExamAttemp> ExamAttemps { get; set; } = null!;
    public DbSet<Discussion> Discussions { get; set; } = null!;

    public DbSet<Post> Posts { get; set; } = null!;
    public DbSet<ForumQuestion> ForumQuestions { get; set; } = null!;
    public DbSet<Likes> Likes { get; set; } = null!;
    public DbSet<Reports> Reports { get; set; } = null!;
    public DbSet<AdminReviewCourse> AdminReviewCourses { get; set; } = null!;
    public DbSet<AdminReviewLesson> AdminReviewLesson { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("AspNetUsers");
        });

        // User ↔ Teacher (1-1)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Teacher)
            .WithOne(t => t.User)
            .HasForeignKey<Teacher>(t => t.UserId);

        // User ↔ Student (1-1)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Student)
            .WithOne(s => s.User)
            .HasForeignKey<Student>(s => s.UserId);

        // User ↔ Admin (1-1)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Admin)
            .WithOne(a => a.User)
            .HasForeignKey<Admin>(a => a.UserId);

        // Admin ↔ UpdateRequestCourse (1-n)
        modelBuilder.Entity<UpdateRequestCourse>()
            .HasOne(ur => ur.ReviewBy)
            .WithMany(a => a.ReviewedRequests)
            .HasForeignKey(ur => ur.ReviewById);

        // Admin - RefundRequestCourses(1 - n)
        modelBuilder.Entity<RefundRequestCourse>()
            .HasOne(r => r.Admin)
            .WithMany(ad => ad.RefundRequestCourses)
            .HasForeignKey(r => r.ProcessedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // Teacher ↔ Course (1-n)
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Teacher)
            .WithMany(t => t.Courses)
            .HasForeignKey(c => c.TeacherId);

        // Teacher ↔ UpdateRequestCourse (1-n)
        modelBuilder.Entity<UpdateRequestCourse>()
            .HasOne(ur => ur.RequestBy)
            .WithMany(t => t.UpdateRequests)
            .HasForeignKey(ur => ur.RequestById);

        // Category ↔ Course (1-n)
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Category)
            .WithMany(cat => cat.Courses)
            .HasForeignKey(c => c.CategoryId);

        // Course ↔ CourseContent (1-1)
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Content)
            .WithOne(cc => cc.Course)
            .HasForeignKey<CourseContent>(cc => cc.CourseId)
            .OnDelete(DeleteBehavior.NoAction);

        // CourseContent ↔ Lesson (1-n)
        modelBuilder.Entity<Lesson>()
            .HasOne(l => l.CourseContent)
            .WithMany(cc => cc.Lessons)
            .HasForeignKey(l => l.CourseContentId);

        // Student ↔ Enrollment ↔ Course
        modelBuilder.Entity<Enrollment_course>()
            .HasOne(e => e.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment_course>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Student ↔ LessonProgress
        modelBuilder.Entity<LessonProgress>()
            .HasOne(l => l.Student)
            .WithMany(s => s.LessonProgresses)
            .HasForeignKey(l => l.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique constraint
        modelBuilder.Entity<Enrollment_course>()
            .HasIndex(e => new { e.StudentId, e.CourseId })
            .IsUnique();

        // Lesson ↔ Material (1-n)
        modelBuilder.Entity<Material>()
            .HasOne(m => m.Lesson)
            .WithMany(l => l.Materials)
            .HasForeignKey(m => m.LessonId);

        // Lesson ↔ LessonProgress
        modelBuilder.Entity<LessonProgress>()
            .HasOne(lp => lp.Lesson)
            .WithMany(s => s.LessonProgresses)
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Restrict);

        // Student ↔ CourseReview (1-n)
        modelBuilder.Entity<CourseReview>()
           .HasOne(r => r.Student)
           .WithMany(s => s.Reviews)
           .HasForeignKey(r => r.StudentId)
           .OnDelete(DeleteBehavior.Restrict);

        // Student - RefundRequestCourse(1 - n)
        modelBuilder.Entity<RefundRequestCourse>()
            .HasOne(r => r.Student)
            .WithMany(s => s.RefundRequestCourses)
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // EnrollmentCourse - RefundRequestCourse(1 - n)
        modelBuilder.Entity<RefundRequestCourse>()
            .HasOne(r => r.Enrollment)
            .WithMany(en => en.RefundRequestCourses)
            .HasForeignKey(r => r.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Course ↔ CourseReview (1-n)
        modelBuilder.Entity<CourseReview>()
           .HasOne(r => r.Course)
           .WithMany(c => c.Reviews)
           .HasForeignKey(r => r.CourseId)
           .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CourseReview>()
           .HasIndex(r => new { r.CourseId, r.StudentId })
           .IsUnique()
           .HasFilter("[IsNewest] = 1");

        // Student ↔ Orders (1-n)
        modelBuilder.Entity<Orders>()
            .HasOne(o => o.Student)
            .WithMany(s => s.Orders)
            .HasForeignKey(o => o.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order ↔ OrderDetails (1-n)
        modelBuilder.Entity<OrderDetail>()
           .HasOne(od => od.Orders)
           .WithMany(o => o.OrderDetails)
           .HasForeignKey(od => od.OrderId)
           .OnDelete(DeleteBehavior.Cascade);

        // Course ↔ OrderDetails (1-n)
        modelBuilder.Entity<OrderDetail>()
           .HasOne(od => od.Course)
           .WithMany(c => c.OrderDetails)
           .HasForeignKey(od => od.CourseId)
           .OnDelete(DeleteBehavior.Restrict);

        // Order ↔ Payments (1-n)
        modelBuilder.Entity<Payment>()
           .HasOne(p => p.Order)
           .WithMany(o => o.Payments)
           .HasForeignKey(p => p.OrderId)
           .OnDelete(DeleteBehavior.Cascade);

        // Exam - ExamAttemp (1 - n)
        modelBuilder.Entity<ExamAttemp>()
            .HasOne(ea => ea.Exam)
            .WithMany(e => e.ExamAttemps)
            .HasForeignKey(ea => ea.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Student - ExamAttemp (1 - n)
        modelBuilder.Entity<ExamAttemp>()
            .HasOne(ea => ea.Student)
            .WithMany(s => s.ExamAttemps)
            .HasForeignKey(ea => ea.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Student - SubmissionExam (n - 1)
        modelBuilder.Entity<SubmissionExam>()
            .HasOne(se => se.Student)
            .WithMany(s => s.SubmissionExams)
            .HasForeignKey(se => se.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Exam - QuestionExam (1-n)
        modelBuilder.Entity<Exam>()
            .HasMany(e => e.Questions)
            .WithOne(q => q.Exam)
            .HasForeignKey(q => q.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // QuestionExam - Choice (1-n)
        modelBuilder.Entity<QuestionExam>()
            .HasMany(q => q.Choices)
            .WithOne(c => c.QuestionExam)
            .HasForeignKey(c => c.QuestionExamId)
            .OnDelete(DeleteBehavior.Cascade);

        // Exam - SubmissionExam (1-n)
        modelBuilder.Entity<Exam>()
            .HasMany(e => e.Submissions)
            .WithOne(s => s.Exam)
            .HasForeignKey(s => s.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubmissionExam - SubmissionAnswer (1 - n)
        modelBuilder.Entity<SubmissionExam>()
            .HasMany(s => s.SubmissionAnswers)
            .WithOne(a => a.SubmissionExam)
            .HasForeignKey(a => a.SubmissionExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubmissionAnswer - SubmissionExam (n - 1)
        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(a => a.SubmissionExam)
            .WithMany(s => s.SubmissionAnswers)
            .HasForeignKey(a => a.SubmissionExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubmissionAnswer - QuestionExam (n - 1)
        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(a => a.QuestionExam)
            .WithMany(qe => qe.SubmissionAnswers)
            .HasForeignKey(a => a.QuestionExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubmissionAnswer - Choice (0 - 1)
        modelBuilder.Entity<SubmissionAnswer>()
            .HasOne(a => a.SelectedChoice)
            .WithMany()
            .HasForeignKey(a => a.SelectedChoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        // CourseContent - Exam (1 - n)
        modelBuilder.Entity<CourseContent>()
            .HasMany(c => c.Exams)
            .WithOne(e => e.CourseContent)
            .HasForeignKey(e => e.CourseContentId)
            .OnDelete(DeleteBehavior.NoAction);

        // Lesson - Exam (1 - n)
        modelBuilder.Entity<Lesson>()
            .HasMany(l => l.Exams)
            .WithOne(e => e.Lesson)
            .HasForeignKey(e => e.LessonId)
            .OnDelete(DeleteBehavior.NoAction);

        // Quan hệ Member - Discussion (1-nhiều)
        modelBuilder.Entity<Student>()
            .HasMany(m => m.Discussions)
            .WithOne(d => d.Student)
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quan hệ Discussion tự tham chiếu (1-nhiều)
        modelBuilder.Entity<Discussion>()
            .HasOne(d => d.ParentDiscussion)
            .WithMany(p => p.Replies)
            .HasForeignKey(d => d.ParentDiscussionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index hữu ích
        modelBuilder.Entity<Discussion>()
            .HasIndex(d => new { d.TargetType, d.TargetTypeId });


        // Member - Discussion (1-nhiều)
        modelBuilder.Entity<Student>()
            .HasMany(m => m.Discussions)
            .WithOne(d => d.Student)
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Discussion tự tham chiếu (1-nhiều)
        modelBuilder.Entity<Discussion>()
            .HasOne(d => d.ParentDiscussion)
            .WithMany(p => p.Replies)
            .HasForeignKey(d => d.ParentDiscussionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Member - Like (1-nhiều)
        modelBuilder.Entity<Student>()
            .HasMany<Likes>()
            .WithOne(l => l.Student)
            .HasForeignKey(l => l.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index để tìm nhanh Like theo đối tượng
        modelBuilder.Entity<Likes>()
            .HasIndex(l => new { l.TargetType, l.TargetId });

        // ========== REPORT ==========
        modelBuilder.Entity<Reports>()
            .HasOne(r => r.Student)
            .WithMany(m => m.Reports)
            .HasForeignKey(r => r.ReporterId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reports>()
            .HasIndex(r => new { r.TargetType, r.TargetTypeId });



        // ========== STUDENT STATS (1-1) ==========
        modelBuilder.Entity<Student>()
            .HasOne(m => m.StudentStats)
            .WithOne(ms => ms.Student)
            .HasForeignKey<StudentStats>(ms => ms.StudentId)
            .OnDelete(DeleteBehavior.Cascade);


        // ========== COURSE STATS ==========
        modelBuilder.Entity<Course>()
            .HasOne(c => c.CourseStats)
            .WithOne(cs => cs.Course)
            .HasForeignKey<CourseStats>(cs => cs.CourseId)
            .OnDelete(DeleteBehavior.Cascade);


        // ========== TEACHER PAYOUT ==========
        modelBuilder.Entity<TeacherPayout>()
            .HasOne(tp => tp.Teacher)
            .WithMany(t => t.TeacherPayouts)
            .HasForeignKey(tp => tp.TeacherId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TeacherPayout>()
            .HasIndex(tp => new { tp.TeacherId, tp.Month, tp.Year })
            .IsUnique(); // mỗi giáo viên chỉ có 1 payout/tháng/năm

        // ========== ADMIN REVIEW COURSE ==========
        modelBuilder.Entity<AdminReviewCourse>()
            .HasOne(arc => arc.Admin)
            .WithMany(a => a.AdminReviewCourses)
            .HasForeignKey(arc => arc.AdminId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AdminReviewCourse>()
            .HasOne(arc => arc.Course)
            .WithOne()
            .HasForeignKey<AdminReviewCourse>(arc => arc.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Course>()
            .HasOne(c => c.AdminReviewCourse)
            .WithOne(arc => arc.Course)
            .HasForeignKey<AdminReviewCourse>(arc => arc.CourseId);

        // ========== ADMIN REVIEW LESSON ==========
        modelBuilder.Entity<AdminReviewLesson>()
            .HasOne(arl => arl.Admin)
            .WithMany(a => a.AdminReviewLessons)
            .HasForeignKey(arl => arl.AdminId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AdminReviewLesson>()
            .HasOne(arl => arl.Lesson)
            .WithOne()
            .HasForeignKey<AdminReviewLesson>(arl => arl.LessonId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AdminReviewLesson>()
            .HasOne(arl => arl.Course)
            .WithMany(c => c.AdminReviewLessons)
            .HasForeignKey(arl => arl.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
