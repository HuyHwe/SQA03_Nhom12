using project.Models;

public class EnrollmentCourseService : IEnrollmentCourseService
{
    private const double passScore = 70;
    private readonly IEnrollmentCourseRepository _enrollmentRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly ILessonProgressRepository _lessonProgressRepository;
    private readonly IExamRepository _examRepository;
    private readonly ISubmissionExamRepository _submissionExamRepository;
    private readonly IRequestRefundCourseRepository _requestRefundCourseRepository;
    private readonly IAdminRepository _adminRepository;
    private readonly IUserRepository _userRepository;
    public EnrollmentCourseService(
        IEnrollmentCourseRepository enrollmentRepository,
        ICourseRepository courseRepository,
        IStudentRepository studentRepository,
        ICourseContentRepository courseContentRepository,
        ILessonRepository lessonRepository,
        IExamRepository examRepository,
        ILessonProgressRepository lessonProgressRepository,
        ISubmissionExamRepository submissionExamRepository,
        IRequestRefundCourseRepository requestRefundCourseRepository,
        IAdminRepository adminRepository,
        IUserRepository userRepository)
    {
        _enrollmentRepository = enrollmentRepository;
        _courseRepository = courseRepository;
        _studentRepository = studentRepository;
        _courseContentRepository = courseContentRepository;
        _lessonRepository = lessonRepository;
        _examRepository = examRepository;
        _lessonProgressRepository = lessonProgressRepository;
        _submissionExamRepository = submissionExamRepository;
        _requestRefundCourseRepository = requestRefundCourseRepository;
        _adminRepository = adminRepository;
        _userRepository = userRepository;
    }

    public async Task<bool> IsEnrolledInCourseAsync(string studentId, string courseId)
    {
        return await _enrollmentRepository.IsEnrollmentExistAsync(studentId, courseId);
    }

    public async Task<IEnumerable<EnrollmentInforDTO>> GetEnrollmentInCourseAsync(string userId, string courseId)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));
        var userIdGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));

        var course = await _courseRepository.GetCourseByIdAsync(courseId)
            ?? throw new KeyNotFoundException($"Course with id: {courseId} not found");
        if (course.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }
        else if (await _adminRepository.IsAdminExistAsync(userId) == false)
        {
            throw new UnauthorizedAccessException("You are not admin");
        }

        var enrollments = await _enrollmentRepository.GetEnrollmentInCourseAsync(courseId);

        if (enrollments == null || !enrollments.Any()) return [];

        return enrollments.Select(en => new EnrollmentInforDTO
        {
            StudentId = en.StudentId ?? "Unknown",
            StudentName = en.Student?.User?.FullName ?? "Unknown",
            CourseId = courseId,
            CourseName = course.Title ?? "Unknown Title",
            EnrolledAt = en.EnrolledAt,
            Progress = en.Progress,
            Status = en.Status ?? "Unknown",
            CertificateUrl = en.CertificateUrl ?? "Unknown"
        });
    }

    public async Task CreateEnrollmentAsync(string courseId, string studentId)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));

        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException($"Course with id: {courseId} not found");
        }

        var studentExist = await _studentRepository.IsStudentExistAsync(studentId);
        if (!studentExist)
        {
            throw new KeyNotFoundException($"Student with id: {studentId} not found");
        }

        // Check Enrollment with Student Exist
        var enrollmentExist = await _enrollmentRepository.IsEnrollmentExistAsync(studentId, courseId);
        if (enrollmentExist)
        {
            throw new Exception("Student has already enrolled in this course");
        }

        var newEnrollment = new Enrollment_course
        {
            Id = Guid.NewGuid().ToString(),
            StudentId = studentId,
            CourseId = courseId,
            EnrolledAt = DateTime.UtcNow,
            Progress = 0.00m,
            Status = "active",
            CertificateUrl = "No Certificate"
        };

        await _enrollmentRepository.CreateEnrollmentAsync(newEnrollment);
    }

    public async Task<EnrollmentInforDTO> GetEnrollmentByIdAsync(string userId, string courseId, string enrollmentId)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));
        var enrollmentGuid = GuidHelper.ParseOrThrow(enrollmentId, nameof(enrollmentId));
        var userIdGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));

        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException($"Course with id: {courseId} not found");
        }
        if (await _userRepository.IsUserExistAsync(userId) == false)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        var enrollment = await _enrollmentRepository.GetEnrrollmentByIdAsync(enrollmentId)
            ?? throw new KeyNotFoundException($"Enrollment with id: {enrollmentId} not found");
        if (enrollment.CourseId != courseId)
        {
            throw new KeyNotFoundException($"Enrollment with id: {enrollmentId} not found in course with id: {courseId}");
        }
        if (enrollment.Student?.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this enrollment");
        }

        return new EnrollmentInforDTO
        {
            StudentId = enrollment.StudentId ?? "Unknown",
            StudentName = enrollment.Student?.User?.FullName ?? "Unknown",
            CourseId = courseId,
            CourseName = enrollment.Course?.Title ?? "Unknown Title",
            EnrolledAt = enrollment.EnrolledAt,
            Progress = enrollment.Progress,
            Status = enrollment.Status ?? "Unknown",
            CertificateUrl = enrollment.CertificateUrl ?? "Unknown"
        };
    }

    public async Task UpdateProgressEnrollmentAsync(string studentId, string courseId, EnrollmentProgressUpdateDTO dto)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));
        var studentIdGuild = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        if (dto.LessonId != null && dto.ExamId == null)
        {
            var lessonGuild = GuidHelper.ParseOrThrow(dto.LessonId, nameof(dto.LessonId));
        }
        else if (dto.ExamId != null && dto.LessonId == null)
        {
            var examGuild = GuidHelper.ParseOrThrow(dto.ExamId, nameof(dto.ExamId));
        }
        else
        {
            throw new ArgumentException("LessonId or ExamId must have value, not both");
        }

        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException($"Course with id: {courseId} not found");
        }

        var enrollment = await _enrollmentRepository.GetEnrollmentByStudentAndCourseIdAsync(studentId, courseId)
            ?? throw new KeyNotFoundException($"Enrollment not found for user with id: {studentId} in course with id: {courseId}");

        // var userExist = await _userRepository.IsUserExistAsync(userId);
        // if (!userExist)
        // {
        //     throw new KeyNotFoundException($"User with id: {userId} not found");
        // }
        // if (enrollment.Student?.User.Id != userId)
        // {
        //     throw new UnauthorizedAccessException("You are not authorized to update this enrollment");
        // }

        // Check status enrollment
        if (enrollment.Status != "active")
        {
            throw new Exception("Only active enrollment can be updated!");
        }

        // Logic calculate progress enrollment

        if (dto.LessonId != null && dto.ExamId == null)
        {
            var lessonExist = await _lessonRepository.LessonExistsAsync(dto.LessonId);
            if (!lessonExist)
            {
                throw new KeyNotFoundException($"Lesson with id: {dto.LessonId} not found");
            }

            var alreadyCompleted = await _lessonProgressRepository.ExistsAsync(dto.LessonId, enrollment.StudentId);
            if (!alreadyCompleted)
            {
                await _lessonProgressRepository.AddNewLessonProgressAsync(new LessonProgress
                {
                    Id = Guid.NewGuid().ToString(),
                    LessonId = dto.LessonId,
                    StudentId = enrollment.StudentId,
                    CompletedAt = DateTime.UtcNow
                });
            }
            else
            {
                return;
            }
        }
        else if (dto.ExamId != null && dto.LessonId == null)
        {
            var (exists, isOpened) = await _examRepository.GetExamStatusAsync(dto.ExamId);
            if (!exists || !isOpened)
            {
                throw new KeyNotFoundException($"Exam with id: {dto.ExamId} not found");
            }
        }

        var progress = await CalculateProgressAsync(courseId, enrollment.StudentId);
        enrollment.Progress = (decimal)progress;
        if (enrollment.Progress >= 95m && enrollment.Status != "Cancelled")
        {
            enrollment.Status = "Completed";
        }

        await _enrollmentRepository.UpdateProgressEnrollmentAsync(enrollment);
    }

    private async Task<double> CalculateProgressAsync(string courseId, string studentId)
    {
        var totalLessons = await _courseContentRepository.TotalLessons(courseId);
        var completedLessons = await _lessonProgressRepository.CountCompletedLessonsAsync(courseId, studentId);
        var lessonProgress = totalLessons == 0 ? 0.0 : (double)completedLessons / totalLessons;

        var totalExams = await _examRepository.TotalExamsInCourseAsync(courseId);
        var passedExams = await _submissionExamRepository.CountPassExamsAsync(courseId, studentId, passScore);
        var examProgress = totalExams == 0 ? 0.0 : (double)passedExams / totalExams;

        return (lessonProgress * 0.7f + examProgress * 0.3f) * 100;
    }

    public async Task RequestCancelEnrollmentAsync(string userId, string courseId, string enrollmentId, RequestCancelEnrollmentDTO dto)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));
        var enrollmentGuid = GuidHelper.ParseOrThrow(enrollmentId, nameof(enrollmentId));

        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException($"Course with id: {courseId} not found");
        }

        var enrollment = await _enrollmentRepository.GetEnrrollmentByIdAsync(enrollmentId)
            ?? throw new KeyNotFoundException($"Enrollment with id: {enrollmentId} not found");

        var userExist = await _userRepository.IsUserExistAsync(userId);
        if (!userExist)
        {
            throw new KeyNotFoundException($"User with id: {userId} not found");
        }
        if (enrollment.Student?.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to update this enrollment");
        }

        if (enrollment.CourseId != courseId)
        {
            throw new KeyNotFoundException($"Course Id is not match with enrollment.");
        }

        if (enrollment.Status != "active")
        {
            throw new Exception("Can't cancel enrollment without active status");
        }
        // Logic check condition before create refundRequest
        var course = await _courseRepository.GetCourseByIdAsync(courseId) ?? throw new KeyNotFoundException($"Course with id: {courseId} not found");
        if (course.Price <= 0)
        {
            throw new Exception("Free courses are not eligible for refunds.");
        }

        var enrollAt = enrollment.EnrolledAt;
        var requestAt = DateTime.UtcNow;
        var difference = requestAt - enrollAt;

        if (difference.TotalDays > 2)
        {
            throw new Exception("Refund requests are only accepted within 2 days of enrollment.");
        }

        if (enrollment.Progress >= 50)
        {
            throw new Exception("Refund not available for courses with progress ≥ 50%.");
        }

        decimal refundAmount;
        if (enrollment.Progress == 0)
        {
            refundAmount = course.Price;
        }
        else
        {
            refundAmount = course.Price * ((100 - enrollment.Progress) / 100.0m);
        }

        var refundRequest = new RefundRequestCourse
        {
            Id = Guid.NewGuid().ToString(),
            EnrollmentId = enrollment.Id,
            StudentId = enrollment.StudentId,
            RefundAmount = refundAmount,
            ProgressSnapshot = enrollment.Progress,
            Reason = dto.ReasonRequest,
            Status = "pending",
            CreatedAt = DateTime.Now
        };
        enrollment.Status = "Peding Refund";

        await _enrollmentRepository.UpdateProgressEnrollmentAsync(enrollment);
        await _requestRefundCourseRepository.CreateRequestRefundCourseAsync(refundRequest);
    }

    public async Task<RecentEnrollmentOfTeacherDTO> GetRecentEnrollmentsOfTeacherAsync(string teacherId, int count)
    {
        var teacherIdGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));

        var teacherExist = await _studentRepository.IsStudentExistAsync(teacherId);
        if (!teacherExist)
        {
            throw new KeyNotFoundException($"Teacher with id: {teacherId} not found");
        }

        var recentEnrollments = await _enrollmentRepository.GetRecentEnrollmentsOfTeacherAsync(teacherId, count);

        var recentEnrollmentDTOs = recentEnrollments.Select(en => new EnrollmentInforDTO
        {
            StudentId = en.StudentId ?? "Unknown",
            StudentName = en.Student?.User?.FullName ?? "Unknown",
            CourseId = en.CourseId ?? "Unknown",
            CourseName = en.Course?.Title ?? "Unknown Title",
            EnrolledAt = en.EnrolledAt,
            Progress = en.Progress,
            Status = en.Status ?? "Unknown",
            CertificateUrl = en.CertificateUrl ?? "Unknown"
        });

        return new RecentEnrollmentOfTeacherDTO
        {
            RecentEnrollments = recentEnrollmentDTOs
        };
    }
}