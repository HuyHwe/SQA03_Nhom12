using project.Models;

public class CourseContentService : ICourseContentService
{
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly ICourseRepository _courseRepository;

    public CourseContentService(
        ICourseContentRepository courseContentRepository,
        ICourseRepository courseRepository)
    {
        _courseContentRepository = courseContentRepository;
        _courseRepository = courseRepository;
    }

    public async Task AddCourseContentAsync(string userId, string courseId, CourseContentCreateDTO contentDto)
    {
        var courseExist = await _courseRepository.GetCourseByIdAsync(courseId) ?? throw new KeyNotFoundException("Course not found");
        if (courseExist.Status != "draft")
        {
            throw new InvalidOperationException("Cannot add course content unless the course is in draft status");
        }
        var courseContentExist = await _courseContentRepository.CourseContentExistsAsync(courseId);
        if (courseContentExist)
        {
            throw new Exception("Course content already exists for this course");
        }
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User not found in token");
        }

        if (courseExist.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var content = new CourseContent
        {
            CourseId = courseId,
            Title = contentDto.Title,
            Introduce = contentDto.Introduce,
        };

        await _courseContentRepository.AddCourseContentAsync(content);
    }

    public async Task UpdateCourseContentAsync(string userId, string contentId, CourseContentUpdateDTO contentDto)
    {
        var contentExist = await _courseContentRepository.CourseContentExistsByContentIdAsync(contentId);
        if (!contentExist)
        {
            throw new KeyNotFoundException("Course content not found");
        }

        var existingContent = await _courseContentRepository.GetCourseContentByIdAsync(contentId) ?? throw new KeyNotFoundException("Course content not found");

        var courseExist = await _courseRepository.GetCourseByIdAsync(existingContent.CourseId) ?? throw new KeyNotFoundException("Course not found");
        if (courseExist.Status != "draft")
        {
            throw new InvalidOperationException("Cannot update course content unless the course is in draft status");
        }
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User not found in token");
        }
        if (courseExist.Teacher.User.Id != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        existingContent.Title = contentDto.Title;
        existingContent.Introduce = contentDto.Introduce;

        await _courseContentRepository.UpdateCourseContentAsync(existingContent);
    }

    public async Task<CourseContentInformationDTO> GetCourseContentInformationDTOAsync(string teacherId, string courseId)
    {
        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException("Course not found");
        }

        // check enrollment or teacher
        // ...

        var courseContent = await _courseContentRepository.GetCourseContentByCourseIdAsync(courseId) ?? throw new KeyNotFoundException("Course content not found");

        return new CourseContentInformationDTO
        {
            Id = courseContent.Id,
            Title = courseContent.Title,
            Introduce = courseContent.Introduce,
        };
    }

    public async Task<CourseContentOverview> GetCourseContentOverviewDTOAsync(string teacherId, string courseId)
    {
        var courseExist = await _courseRepository.GetCourseByIdByTeacherAsync(courseId, teacherId)
            ?? throw new KeyNotFoundException("Course not found");

        if (courseExist.TeacherId != teacherId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var courseContent = await _courseContentRepository.GetCourseContentOverviewByCourseIdAsync(courseId) ?? throw new KeyNotFoundException("Course content not found");

        var lessonIds = courseContent.Lessons.Select(lesson => new LessonOverviewDTO
        {
            Id = lesson.Id,
            Title = lesson.Title,
        }).ToList();

        return new CourseContentOverview
        {
            Id = courseContent.Id,
            Lessons = lessonIds,
        };
    }
}