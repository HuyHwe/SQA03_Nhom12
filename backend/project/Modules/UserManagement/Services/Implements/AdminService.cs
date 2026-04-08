using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using project.Models;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    const string NO_REVIEW_STATUS = "NoReview";
    const string IN_REVIEW_STATUS = "InReview";
    const string REVIEWED_STATUS = "Reviewed";
    const string APPROVED_STATUS = "Published";
    const string REJECTED_STATUS = "Rejected";

    public AdminService(
        IAdminRepository adminRepository,
        ICourseRepository courseRepository,
        IUserRepository userRepository,
        ILessonRepository lessonRepository,
        IUnitOfWork unitOfWork)
    {
        _adminRepository = adminRepository;
        _courseRepository = courseRepository;
        _userRepository = userRepository;
        _lessonRepository = lessonRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PageResultCoursesDTO> GetCoursesByAdminAsync(string userId, string? status, int page, int pageSize)
    {
        var adminExist = await _adminRepository.IsAdminExistAsync(userId);
        if (adminExist == false)
        {
            throw new UnauthorizedAccessException("Admin not found");
        }

        var (courses, totalCount) = await _adminRepository.GetCoursesByAdminAsync(status, page, pageSize);

        var courseResult = courses.Select(c => new CourseInformationDTO
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            DiscountPrice = c.DiscountPrice,
            Status = c.Status,
            ReviewStatus = c.AdminReviewCourse?.Status ?? NO_REVIEW_STATUS,
            ReviewByAdminId = c.AdminReviewCourse?.AdminId,
            ReviewByAdminName = c.AdminReviewCourse?.Admin?.User?.FullName,
            ThumbnailUrl = c.ThumbnailUrl,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            AverageRating = c.AverageRating,
            ReviewCount = c.ReviewCount,
            CategoryId = c.CategoryId,
            CategoryName = c.Category?.Name ?? "Unknown",
            TeacherId = c.TeacherId,
            TeacherName = c.Teacher?.User?.FullName ?? "Unknown",
            RejectReason = c.AdminReviewCourse?.Reason
        });

        return new PageResultCoursesDTO
        {
            Courses = courseResult,
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };
    }

    public async Task<FullCourseDTO> GetFullCourseByIdAsync(string userId, string courseId)
    {
        var adminExist = await _adminRepository.IsAdminExistAsync(userId);
        if (adminExist == false)
        {
            throw new UnauthorizedAccessException("Admin not found");
        }

        var reviewStatus = NO_REVIEW_STATUS;
        var reviewByAdminId = (string?)null;
        var reviewByAdminName = (string?)null;

        var course = await _adminRepository.GetFullCourseByIdAsync(courseId) ?? throw new KeyNotFoundException("Course not found");
        var adminReviewRecord = await _adminRepository.GetAdminReviewCourseRecordAsync(courseId);
        if (adminReviewRecord != null)
        {
            reviewStatus = adminReviewRecord.Status;
            reviewByAdminId = adminReviewRecord.AdminId;
            reviewByAdminName = await _adminRepository.GetAdminNameAsync(reviewByAdminId);
        }

        return new FullCourseDTO
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = (double)course.Price,
            Discount = (double?)course.DiscountPrice,
            Status = course.Status,
            ReviewStatus = reviewStatus,
            ReviewByAdminId = reviewByAdminId,
            ReviewByAdminName = reviewByAdminName,
            ThumbnailUrl = course.ThumbnailUrl,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            AverageRating = course.AverageRating,
            ReviewCount = course.ReviewCount,
            CategoryId = course.CategoryId,
            CategoryName = course.Category?.Name ?? "Unknown",
            TeacherId = course.TeacherId,
            TeacherName = course.Teacher?.User?.FullName ?? "Unknown",
            CourseContent = new FullCourseContentDTO
            {
                Id = course.Content.Id,
                Lessons = course.Content.Lessons.Select(l => new LessonCardDTO
                {
                    Id = l.Id,
                    Title = l.Title,
                    Duration = l.Duration,
                    Order = l.Order
                }).ToList()
            }
        };

    }

    public async Task AdminApproveCourseAsync(string userId, string courseId)
    {
        var adminId = await _adminRepository.GetAdminIdAsync(userId);
        var recordExist = await _adminRepository.GetAdminReviewCourseRecordAsync(courseId);
        if (recordExist != null)
        {
            if (recordExist.AdminId != adminId)
            {
                throw new UnauthorizedAccessException("You are not authorized to approve this course.");
            }
            if (recordExist.Status == REVIEWED_STATUS && string.IsNullOrEmpty(recordExist.Reason))
            {
                throw new InvalidOperationException("This course has already been approved.");
            }
        }

        var lessonsReviewed = await _adminRepository.GetAdminReviewedLessonsAsync(adminId, courseId);
        if (!lessonsReviewed.Any())
        {
            throw new InvalidOperationException("You must review at least one lesson before approving the course.");
        }

        await _adminRepository.UpdateAdminReviewCourseAsync(courseId, REVIEWED_STATUS, null);
        await _courseRepository.UpdateCourseStatusAsync(courseId, APPROVED_STATUS);
    }

    public async Task AdminRejectCourseAsync(string userId, string courseId, string RejectReason)
    {
        var adminId = await _adminRepository.GetAdminIdAsync(userId);
        var recordExist = await _adminRepository.GetAdminReviewCourseRecordAsync(courseId);
        if (recordExist != null)
        {
            if (recordExist.AdminId != adminId)
            {
                throw new UnauthorizedAccessException("You are not authorized to approve this course.");
            }
            if (recordExist.Status == REVIEWED_STATUS && string.IsNullOrEmpty(recordExist.Reason))
            {
                throw new InvalidOperationException("This course has already been approved.");
            }
        }

        var lessonsReviewed = await _adminRepository.GetAdminReviewedLessonsAsync(adminId, courseId);
        if (!lessonsReviewed.Any())
        {
            throw new InvalidOperationException("You must review at least one lesson before approving the course.");
        }

        await _adminRepository.UpdateAdminReviewCourseAsync(courseId, REVIEWED_STATUS, RejectReason);
        await _courseRepository.UpdateCourseStatusAsync(courseId, REJECTED_STATUS);
    }

    public async Task<IEnumerable<RefundRequestCourseDTO>> GetPendingRefundRequestsAsync()
    {
        var refundRequests = await _adminRepository.GetRefundRequestsByStatusAsync("pending");
        return refundRequests.Select(rrc => new RefundRequestCourseDTO
        {
            Id = rrc.Id,
            StudentId = rrc.StudentId,
            StudentName = rrc.Student.User.FullName,
            ProcessedBy = rrc.Admin.AdminId,
            EnrollmentId = rrc.EnrollmentId,
            CourseId = rrc.Enrollment.Course.Id,
            CourseTitle = rrc.Enrollment.Course.Title,
            Reason = rrc.Reason,
            Status = rrc.Status,
            CreatedAt = rrc.CreatedAt,
            ProcessedAt = rrc.ProcessedAt,
            RefundAmount = rrc.RefundAmount,
            ProgressSnapshot = rrc.ProgressSnapshot
        });
    }

    public async Task AdminReviewCourseAsync(string userId, string courseId)
    {
        var adminId = await _adminRepository.GetAdminIdAsync(userId);
        var adminName = await _userRepository.GetUserNameAsync(userId);

        var recordExist = await _adminRepository.IsAdminReviewCourseRecordExistAsync(courseId);
        if (recordExist)
        {
            throw new InvalidOperationException("This course has already been reviewed by other admin.");
        }

        var lessonCount = await _lessonRepository.CountLessonsByCourseAsync(courseId);
        var allowedLesson = Math.Max(1, (int)Math.Ceiling(lessonCount / 10.0));

        var AdminReviewCourseRecord = new AdminReviewCourse
        {
            Id = Guid.NewGuid().ToString(),
            AdminId = adminId,
            CourseId = courseId,
            ReviewedAt = DateTime.UtcNow,
            Status = IN_REVIEW_STATUS,
            AllowedLessonCount = allowedLesson,
        };

        await _adminRepository.AdminReviewCourseAsync(AdminReviewCourseRecord);
    }

    public async Task<Lesson?> AdminReviewLessonAsync(string userId, string courseId, string lessonId)
    {
        var adminId = await _adminRepository.GetAdminIdAsync(userId);
        var adminName = await _userRepository.GetUserNameAsync(userId);

        var adminReviewCourseRecord = await _adminRepository.GetAdminReviewCourseRecordAsync(courseId)
            ?? throw new KeyNotFoundException("Admin review record for the course not found.");

        if (adminReviewCourseRecord.AdminId != adminId)
        {
            throw new UnauthorizedAccessException("You are not authorized to review lessons for this course.");
        }

        // if (adminReviewCourseRecord.Status == REVIEWED_STATUS)
        // {
        //     throw new InvalidOperationException("The course review has already been completed.");
        // }

        var lessonsReviewed = await _adminRepository.GetAdminReviewedLessonsAsync(adminId, courseId);
        var isLessonAlreadyReviewed = lessonsReviewed.Any(lr => lr.LessonId == lessonId);

        if (lessonsReviewed.Count() >= adminReviewCourseRecord.AllowedLessonCount && !isLessonAlreadyReviewed)
        {
            throw new InvalidOperationException("You have reached the maximum number of lessons you can review for this course.");
        }

        if (!isLessonAlreadyReviewed)
        {
            var adminReviewLessonRecord = new AdminReviewLesson
            {
                Id = Guid.NewGuid().ToString(),
                AdminId = adminId,
                CourseId = courseId,
                LessonId = lessonId
            };

            await _adminRepository.AdminReviewLessonAsync(adminReviewLessonRecord);
        }

        var lesson = await _lessonRepository.AdminGetLessonByIdAsync(lessonId);
        return lesson;
    }
}