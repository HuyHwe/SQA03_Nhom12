public class RequestUpdateService : IRequestUpdateService
{
    private readonly IRequestUpdateRepository _requestUpdateRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly ITeacherRepository _teacherRepository;

    public RequestUpdateService(
        IRequestUpdateRepository requestUpdateRepository,
        ICourseRepository courseRepository,
        ICourseContentRepository courseContentRepository,
        ILessonRepository lessonRepository,
        ITeacherRepository teacherRepository)
    {
        _requestUpdateRepository = requestUpdateRepository;
        _courseRepository = courseRepository;
        _courseContentRepository = courseContentRepository;
        _lessonRepository = lessonRepository;
        _teacherRepository = teacherRepository;
    }

    public async Task CreateRequestUpdateAsync(string userId, RequestUpdateRequestDTO requestDto)
    {
        var targetType = requestDto.TargetType;

        if (!Guid.TryParse(requestDto.TargetId, out _) || !Guid.TryParse(userId, out _))
        {
            throw new ArgumentException("Invalid TargetId or RequestById. It must be a valid GUID.");
        }

        switch (targetType.ToLowerInvariant())
        {
            case "course":
                var course = await _courseRepository.GetCourseByIdAsync(requestDto.TargetId)
                    ?? throw new ArgumentException("Course with the given TargetId does not exist.");
                if (course.Teacher.User.Id != userId)
                    throw new ArgumentException("You are not the teacher of this course.");
                break;

            case "coursecontent":
                var courseContent = await _courseContentRepository.GetCourseContentByIdAsync(requestDto.TargetId)
                    ?? throw new ArgumentException("CourseContent with the given TargetId does not exist.");
                if (courseContent.Course.Teacher.User.Id != userId)
                    throw new ArgumentException("You are not the teacher of this course content.");
                break;

            case "lesson":
                var lesson = await _lessonRepository.GetLessonByIdAsync(requestDto.TargetId)
                    ?? throw new ArgumentException("Lesson with the given TargetId does not exist.");
                if (lesson.CourseContent.Course.Teacher.User.Id != userId)
                    throw new ArgumentException("You are not the teacher of this lesson.");
                break;

            default:
                throw new ArgumentException("Invalid TargetType. Only 'course', 'coursecontent', 'lesson' is allowed.");
        }

        if (await _teacherRepository.IsTeacherExistsAsync(userId) == false)
        {
            throw new ArgumentException("Teacher with the given RequestById does not exist.");
        }

        var updateRequestCourse = new UpdateRequestCourse
        {
            TargetType = requestDto.TargetType,
            TargetId = requestDto.TargetId,
            RequestById = userId,
            UpdatedDataJSON = requestDto.UpdatedDataJSON,
            RequestedAt = DateTime.UtcNow
        };

        await _requestUpdateRepository.CreateRequestUpdateRequestAsync(updateRequestCourse);
    }
}