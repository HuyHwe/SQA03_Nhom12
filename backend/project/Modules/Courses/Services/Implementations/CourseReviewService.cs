using project.Models;

public class CourseReviewService : ICourseReviewService
{
    private readonly ICourseReviewRepository _courseReviewRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly IEnrollmentCourseRepository _enrollmentCourseRepository;
    public CourseReviewService(
        ICourseReviewRepository courseReviewRepository,
        ICourseRepository courseRepository,
        IStudentRepository studentRepository,
        IEnrollmentCourseRepository enrollmentCourseRepository
    )
    {
        _courseReviewRepository = courseReviewRepository;
        _courseRepository = courseRepository;
        _studentRepository = studentRepository;
        _enrollmentCourseRepository = enrollmentCourseRepository;
    }

    public async Task<bool> CheckReviewedCourseAsync(string courseId, string studentId)
    {
        var isReviewed = await _courseReviewRepository.CheckReviewedCourseAsync(courseId, studentId);
        return isReviewed;
    }

    public async Task AddCourseReviewAsync(string courseId, string studentId, CourseReviewCreateDTO courseReviewCreateDTO)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));

        var course = await _courseRepository.GetCourseByIdAsync(courseId) ?? throw new KeyNotFoundException($"Course with id {courseId} not found");

        var studentExists = await _studentRepository.IsStudentExistAsync(studentId);
        if (!studentExists)
        {
            throw new Exception($"Student with id {studentId} not found");
        }
        var enrollment = await _enrollmentCourseRepository.IsEnrollmentExistAsync(studentId, courseId);
        if (!enrollment)
        {
            throw new Exception($"Student with id {studentId} is not enrolled in course with id {courseId}");
        }
        var reviewExist = await _courseReviewRepository.CheckReviewedCourseAsync(courseId, studentId);
        if (reviewExist)
        {
            throw new Exception($"Student with id {studentId} has already reviewed course with id {courseId}");
        }

        var review = new CourseReview
        {
            CourseId = courseId,
            Rating = courseReviewCreateDTO.Rating,
            Comment = courseReviewCreateDTO.Comment,
            StudentId = studentId,
            CreatedAt = DateTime.UtcNow,
            IsNewest = true,
            ParentId = null
        };

        await _courseReviewRepository.CreateCourseReviewAsync(review);

        // Update rating course
        course.ReviewCount += 1;
        course.AverageRating = ((course.AverageRating * (course.ReviewCount - 1)) + courseReviewCreateDTO.Rating) / course.ReviewCount;
        await _courseRepository.UpdateCourseAsync(course);
    }

    public async Task UpdateCourseReviewAsync(string reviewId, CourseReviewUpdateDTO courseReviewUpdateDTO)
    {
        var reviewIdGuid = GuidHelper.ParseOrThrow(reviewId, nameof(reviewId));

        var reviewExists = await _courseReviewRepository.CourseReviewExistsAsync(reviewIdGuid.ToString());
        if (!reviewExists)
        {
            throw new Exception($"Review with id {reviewId} not found");
        }

        var review = await _courseReviewRepository.GetCourseReviewByIdAsync(reviewId) ??
            throw new Exception($"Review with id {reviewId} not found");

        var course = await _courseRepository.GetCourseByIdAsync(review.CourseId) ?? throw new KeyNotFoundException($"Course with id {review.CourseId} not found");

        var newestReview = new CourseReview
        {
            Id = Guid.NewGuid().ToString(),
            CourseId = review.CourseId,
            StudentId = review.StudentId,
            Comment = courseReviewUpdateDTO.Comment ?? review.Comment,
            Rating = courseReviewUpdateDTO.Rating ?? review.Rating,
            ParentId = review.Id,
            CreatedAt = DateTime.UtcNow,
            IsNewest = true
        };
        review.IsNewest = false;

        await _courseReviewRepository.CreateCourseReviewAsync(newestReview);

        // Update rating course
        course.AverageRating = ((course.AverageRating * (course.ReviewCount - 1)) + courseReviewUpdateDTO.Rating ?? review.Rating) / course.ReviewCount;
        await _courseRepository.UpdateCourseAsync(course);
    }

    public async Task<IEnumerable<CourseReviewInforDTO>> GetAllReviewsByCourseIdAsync(string courseId)
    {
        var courseIdGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));

        var courseExists = await _courseRepository.CourseExistsAsync(courseIdGuid.ToString());
        if (!courseExists)
        {
            throw new Exception($"Course with id {courseId} not found");
        }

        var reviews = await _courseReviewRepository.GetReviewsByCourseIdAsync(courseId);

        return reviews.Select(r => new CourseReviewInforDTO
        {
            Id = r.Id,
            CourseId = r.CourseId,
            StudentId = r.StudentId,
            StudentName = r.Student.User.FullName,
            StudentAvatarUrl = r.Student.User.AvatarUrl,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            IsNewest = r.IsNewest,
            ParentId = r.ParentId
        });
    }

    public async Task<IEnumerable<CourseReviewInforDTO>> GetReviewsByStudentIdAsync(string studentId)
    {
        var studentIdGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));

        var studentExists = await _studentRepository.IsStudentExistAsync(studentIdGuid.ToString());
        if (!studentExists)
        {
            throw new Exception($"Student with id {studentId} not found");
        }

        var reviews = await _courseReviewRepository.GetReviewsByStudentIdAsync(studentId);

        return reviews.Select(r => new CourseReviewInforDTO
        {
            Id = r.Id,
            CourseId = r.CourseId,
            StudentId = r.StudentId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            IsNewest = r.IsNewest,
            ParentId = r.ParentId
        });
    }
}