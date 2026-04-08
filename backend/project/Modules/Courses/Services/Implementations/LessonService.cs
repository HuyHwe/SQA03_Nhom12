using project.Models;

public class LessonService : ILessonService
{
    private readonly ILessonRepository _lessonRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentCourseRepository _enrollmentRepository;

    public LessonService(
        ILessonRepository lessonRepository,
        ICourseContentRepository courseContentRepository,
        ICourseRepository courseRepository,
        IEnrollmentCourseRepository enrollmentRepository)
    {
        _lessonRepository = lessonRepository;
        _courseContentRepository = courseContentRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<LessonInformationDTO> GetLessonByIdAsync(string studentId, string courseContentId, string id)
    {
        var courseContentExist = await _courseContentRepository.GetCourseContentByIdAsync(courseContentId) ?? throw new Exception($"Course content with id: {courseContentId} not found");
        var courseId = courseContentExist.CourseId;

        var enrollmentExist = await _enrollmentRepository.IsEnrollmentExistAsync(studentId, courseId);
        if (!enrollmentExist)
        {
            throw new Exception("You are not enrolled in this course");
        }

        var lesson = await _lessonRepository.GetLessonByIdAsync(id) ?? throw new Exception($"Lesson with id: {id} not found");
        return new LessonInformationDTO
        {
            Id = lesson.Id,
            CourseContentId = lesson.CourseContentId,
            CourseId = lesson.CourseContent.CourseId,
            CourseTitle = lesson.CourseContent.Course.Title,
            Title = lesson.Title,
            VideoUrl = lesson.VideoUrl,
            Duration = lesson.Duration,
            TextContent = lesson.TextContent,
            Order = lesson.Order
        };
    }

    public async Task<IEnumerable<LessonCardDTO>> GetLessonsByCourseContentIdAsync(string courseContentId)
    {
        var courseContentExist = await _courseContentRepository.CourseContentExistsByContentIdAsync(courseContentId);
        if (!courseContentExist)
        {
            throw new Exception($"Course content with id: {courseContentId} not found");
        }
        var lessons = await _lessonRepository.GetLessonsByCourseContentIdAsync(courseContentId);
        return lessons.Select(lesson => new LessonCardDTO
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Duration = lesson.Duration,
            Order = lesson.Order
        });
    }

    public async Task AddLessonAsync(string userId, string courseContentId, LessonCreateDTO lessonDto)
    {
        var userGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));
        // Check if the course is in Draft status
        var courseContent = await _courseContentRepository.GetCourseContentByIdAsync(courseContentId) ?? throw new Exception($"Course content with id: {courseContentId} not found");

        var course = await _courseRepository.GetCourseByIdAsync(courseContent.CourseId);

        if (course == null || !course.Status.ToLower().Equals("draft", StringComparison.InvariantCultureIgnoreCase))
        {
            throw new Exception("Can only update lessons for courses in Draft status");
        }
        if (course.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var lesson = new Lesson
        {
            Id = Guid.NewGuid().ToString(),
            Title = lessonDto.Title,
            VideoUrl = lessonDto.VideoUrl,
            Duration = lessonDto.Duration,
            TextContent = lessonDto.TextContent,
            Order = lessonDto.Order,
            CourseContentId = courseContentId
        };

        await _lessonRepository.AddLessonAsync(lesson);
    }

    public async Task UpdateLessonAsync(string userId, string courseContentId, string id, LessonUpdateDTO lessonDto)
    {
        var userGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));
        var courseContent = await _courseContentRepository.GetCourseContentByIdAsync(courseContentId) ?? throw new Exception($"Course content with id: {courseContentId} not found");

        var course = await _courseRepository.GetCourseByIdAsync(courseContent.CourseId);

        if (course == null || !course.Status.ToLower().Equals("draft", StringComparison.InvariantCultureIgnoreCase))
        {
            throw new Exception("Can only update lessons for courses in Draft status");
        }
        if (course.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var existingLesson = await _lessonRepository.GetLessonByIdAsync(id) ?? throw new Exception($"Lesson with id: {id} not found");

        existingLesson.Title = lessonDto.Title ?? existingLesson.Title;
        existingLesson.VideoUrl = lessonDto.VideoUrl ?? existingLesson.VideoUrl;
        existingLesson.Duration = lessonDto.Duration ?? existingLesson.Duration;
        existingLesson.TextContent = lessonDto.TextContent ?? existingLesson.TextContent;

        await _lessonRepository.UpdateLessonAsync(existingLesson);
    }

    public async Task UpdateOrderLessonsAsync(string userId, string courseContentId, List<LessonOrderDTO> lessonOrders)
    {
        var userGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));
        // Check if the course is in Draft status
        var courseContent = await _courseContentRepository.GetCourseContentByIdAsync(courseContentId) ?? throw new Exception($"Course content with id: {courseContentId} not found");

        var course = await _courseRepository.GetCourseByIdAsync(courseContent.CourseId);

        if (course == null || !course.Status.ToLower().Equals("draft", StringComparison.InvariantCultureIgnoreCase))
        {
            throw new Exception("Can only update lessons for courses in Draft status");
        }
        if (course.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var lessons = await _lessonRepository.GetLessonsByCourseContentIdAsync(courseContentId);

        var lessonsIdFromDB = lessons.Select(l => l.Id).ToHashSet();
        var lessonsIdFromRequest = lessonOrders.Select(lo => lo.LessonId).ToHashSet();

        if (!lessonsIdFromDB.SetEquals(lessonsIdFromRequest))
        {
            throw new Exception("Lesson IDs in the request do not match the existing lessons");
        }

        var updatedLessons = lessonOrders.Select(lesson => new Lesson
        {
            Id = lesson.LessonId,
            Order = lesson.Order,
        })
        .ToList();

        await _lessonRepository.UpdateOrderLessonsAsync(updatedLessons);
    }
}