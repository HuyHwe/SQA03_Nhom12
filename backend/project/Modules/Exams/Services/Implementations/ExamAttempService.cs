public class ExamAttempService : IExamAttempService
{
    private readonly IExamAttempRepository _examAttempRepository;
    private readonly IExamRepository _examRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly IEnrollmentCourseRepository _enrollmentCourseRepository;

    public ExamAttempService(
        IExamAttempRepository examAttempRepository,
        ICourseRepository courseRepository,
        ILessonRepository lessonRepository,
        ICourseContentRepository courseContentRepository,
        IEnrollmentCourseRepository enrollmentCourseRepository,
        IExamRepository examRepository)
    {
        _examAttempRepository = examAttempRepository;
        _courseRepository = courseRepository;
        _lessonRepository = lessonRepository;
        _courseContentRepository = courseContentRepository;
        _enrollmentCourseRepository = enrollmentCourseRepository;
        _examRepository = examRepository;
    }

    public async Task<ExamAttempDTO?> AddExamAttempAsync(string studentId, string examId)
    {
        var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        var examGuid = GuidHelper.ParseOrThrow(examId, nameof(examId));
        var exam = await _examRepository.GetExamByIdAsync(examId) ?? throw new KeyNotFoundException($"Exam with id {examId} not found.");

        // check for existing active attempt
        var existingAttempt = await _examAttempRepository
            .GetActiveAttemptAsync(studentId, examId, DateTime.UtcNow);

        if (existingAttempt != null)
        {
            return new ExamAttempDTO
            {
                Id = existingAttempt.Id,
                StudentId = existingAttempt.StudentId,
                ExamId = existingAttempt.ExamId,
                AttemptedAt = existingAttempt.AttemptedAt,
                StartTime = existingAttempt.StartTime,
                EndTime = existingAttempt.EndTime,
                IsSubmitted = existingAttempt.IsSubmitted,
                SavedAnswers = existingAttempt.SavedAnswers,
                SubmittedAt = existingAttempt.SubmittedAt
            };
        }

        // check if student is enrolled in the course associated with the exam
        if (exam.CourseContentId != null || exam.LessonId != null)
        {
            var courseId = "";
            if (exam.CourseContentId != null)
            {
                var courseContent = await _courseContentRepository.GetCourseContentByIdAsync(exam.CourseContentId);
                courseId = courseContent?.CourseId;
            }
            else if (exam.LessonId != null)
            {
                var lesson = await _lessonRepository.GetLessonByIdAsync(exam.LessonId);
                var courseContent = lesson != null ? await _courseContentRepository.GetCourseContentByIdAsync(lesson.CourseContentId) : null;
                courseId = courseContent?.CourseId;
            }
            if (courseId == null || string.IsNullOrWhiteSpace(courseId))
            {
                throw new KeyNotFoundException("Associated course not found for this exam.");
            }
            var isEnrolled = await _enrollmentCourseRepository.IsEnrollmentExistAsync(studentId, courseId);
            if (!isEnrolled)
            {
                throw new UnauthorizedAccessException($"You are not enrolled in the course associated with this exam. {studentId}, {courseId} ");
            }
        }

        var examAttemp = new ExamAttemp
        {
            Id = Guid.NewGuid().ToString(),
            StudentId = studentId,
            ExamId = examId,
            AttemptedAt = DateTime.UtcNow,
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddMinutes(exam.DurationMinutes),
            IsSubmitted = false,
            SavedAnswers = null,
            SubmittedAt = DateTime.MinValue
        };

        await _examAttempRepository.AddExamAttempAsync(examAttemp);

        return new ExamAttempDTO
        {
            Id = examAttemp.Id,
            StudentId = examAttemp.StudentId,
            ExamId = examAttemp.ExamId,
            AttemptedAt = examAttemp.AttemptedAt,
            StartTime = examAttemp.StartTime,
            EndTime = examAttemp.EndTime,
            IsSubmitted = examAttemp.IsSubmitted,
            SavedAnswers = examAttemp.SavedAnswers,
            SubmittedAt = examAttemp.SubmittedAt
        };
    }

    public async Task SaveExamAnswersAsync(string studentId, string attemptId, string answers)
    {
        var examAttemp = await _examAttempRepository.GetExamAttempByIdAsync(attemptId)
            ?? throw new KeyNotFoundException($"Exam attempt with id {attemptId} not found.");

        if (examAttemp.StudentId != studentId)
        {
            throw new UnauthorizedAccessException("You are not authorized to save answers for this exam attempt.");
        }

        if (examAttemp.IsSubmitted || DateTime.UtcNow > examAttemp.EndTime || DateTime.UtcNow < examAttemp.StartTime)
        {
            throw new InvalidOperationException("Cannot save answers for a submitted or expired exam attempt.");
        }

        examAttemp.SavedAnswers = answers;

        await _examAttempRepository.SaveExamAttempAsync(examAttemp);
    }

    public async Task<ExamAttempDTO?> GetExamAttempByIdAsync(string studentId, string attemptId)
    {
        var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        var examAttemp = await _examAttempRepository.GetExamAttempByIdAsync(attemptId)
            ?? throw new KeyNotFoundException($"Exam attempt with id {attemptId} not found.");

        if (examAttemp.StudentId != studentId)
        {
            throw new UnauthorizedAccessException("You are not authorized to access this exam attempt.");
        }

        return new ExamAttempDTO
        {
            Id = examAttemp.Id,
            StudentId = examAttemp.StudentId,
            ExamId = examAttemp.ExamId,
            AttemptedAt = examAttemp.AttemptedAt,
            StartTime = examAttemp.StartTime,
            EndTime = examAttemp.EndTime,
            IsSubmitted = examAttemp.IsSubmitted,
            SavedAnswers = examAttemp.SavedAnswers,
            SubmittedAt = examAttemp.SubmittedAt
        };
    }
}