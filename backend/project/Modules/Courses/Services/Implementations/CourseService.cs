using project.Models;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITeacherRepository _teacherRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly DBContext _dbContext;

    public CourseService(
        ICourseRepository courseRepository,
        ICourseContentRepository courseContentRepository,
        ICategoryRepository categoryRepository,
        IUserRepository userRepository,
        ITeacherRepository teacherRepository,
        IStudentRepository studentRepository,
        ILessonRepository lessonRepository,
        DBContext dbContext)
    {
        _courseRepository = courseRepository;
        _courseContentRepository = courseContentRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _teacherRepository = teacherRepository;
        _studentRepository = studentRepository;
        _lessonRepository = lessonRepository;
        _dbContext = dbContext;
    }

    const string DRAFT_STATUS = "draft";
    const string PENDING_STATUS = "pending";
    const string PUBLISHED_STATUS = "published";
    const string REJECTED_STATUS = "rejected";

    public async Task<IEnumerable<CourseInformationDTO>> GetAllCoursesAsync()
    {
        var courses = await _courseRepository.GetAllCoursesAsync();

        return courses.Select(c => new CourseInformationDTO
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            DiscountPrice = c.DiscountPrice,
            Status = c.Status,
            ThumbnailUrl = c.ThumbnailUrl,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            AverageRating = c.AverageRating,
            ReviewCount = c.ReviewCount,
            CategoryId = c.CategoryId,
            CategoryName = c.Category.Name,
            TeacherId = c.TeacherId,
            TeacherName = c.Teacher.User.FullName
        });
    }

    public async Task<PageResultCoursesDTO> SearchItemsAsync(string? keyword, string? category, int page, int pageSize)
    {
        try
        {
            var (courses, totalCount) = await _courseRepository.SearchItemsAsync(keyword, category, page, pageSize);
            var courseResult = courses.Select(c => new CourseInformationDTO
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Price = c.Price,
                DiscountPrice = c.DiscountPrice,
                Status = c.Status,
                ThumbnailUrl = c.ThumbnailUrl,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                AverageRating = c.AverageRating,
                ReviewCount = c.ReviewCount,
                CategoryId = c.CategoryId,
                CategoryName = c.Category?.Name ?? "Unknown",
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher?.User?.FullName ?? "Unknown"
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
        catch (Exception ex)
        {
            throw new Exception("Error when retriev course: ", ex);
        }

    }

    public async Task<CourseInformationDTO> GetCourseByIdAsync(string teacherId, string id)
    {
        var course = await _courseRepository.GetCourseByIdAsync(id) ?? throw new KeyNotFoundException("Course not found");
        return new CourseInformationDTO
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            DiscountPrice = course.DiscountPrice,
            Status = course.Status,
            ThumbnailUrl = course.ThumbnailUrl,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            AverageRating = course.AverageRating,
            ReviewCount = course.ReviewCount,
            CategoryId = course.CategoryId,
            CategoryName = course.Category.Name,
            TeacherId = course.TeacherId,
            TeacherName = course.Teacher.User.FullName
        };
    }

    public async Task AddCourseAsync(string teacherId, CourseCreateDTO courseDto)
    {
        var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
        if (!await _teacherRepository.IsTeacherExistsAsync(teacherId))
        {
            throw new KeyNotFoundException("Teacher not found");
        }
        var course = new Course
        {
            Title = courseDto.Title,
            Description = courseDto.Description,
            CategoryId = courseDto.CategoryId,
            TeacherId = teacherId,
            Price = courseDto.Price,
            DiscountPrice = courseDto.DiscountPrice,
            ThumbnailUrl = courseDto.ThumbnailUrl,
            Status = DRAFT_STATUS,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _courseRepository.AddCourseAsync(course);
    }

    public async Task UpdateCourseAsync(string teacherId, string courseId, CourseUpdateDTO courseDto)
    {
        var courseExist = await _courseRepository.GetCourseByIdAsync(courseId) ??
            throw new KeyNotFoundException("Course not found");
        if (!courseExist.Status.Equals(DRAFT_STATUS, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new InvalidOperationException("Only draft courses can be updated");
        }
        var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
        if (courseExist.TeacherId != teacherId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }
        courseExist.Title = courseDto.Title;
        courseExist.Description = courseDto.Description;
        courseExist.CategoryId = courseDto.CategoryId;
        courseExist.Price = courseDto.Price;
        courseExist.DiscountPrice = courseDto.DiscountPrice;
        courseExist.ThumbnailUrl = courseDto.ThumbnailUrl;

        await _courseRepository.UpdateCourseAsync(courseExist);
    }

    public async Task UpdateFullCourseAsync(string teacherId, string courseId, FullCourseUpdateDTO fullCourseDto)
    {
        var courseExist = await _courseRepository.GetCourseByStatusAsync(courseId, DRAFT_STATUS) ??
            throw new KeyNotFoundException("Course not found");
        if (!courseExist.Status.Equals(DRAFT_STATUS, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new InvalidOperationException("Only draft courses can be updated");
        }
        var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
        if (courseExist.TeacherId != teacherId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            courseExist.Title = fullCourseDto.Title;
            courseExist.Description = fullCourseDto.Description;
            courseExist.CategoryId = fullCourseDto.CategoryId;
            courseExist.Price = (decimal)fullCourseDto.Price;
            courseExist.DiscountPrice = (decimal?)fullCourseDto.Discount;
            courseExist.ThumbnailUrl = fullCourseDto.Thumbnail;
            courseExist.UpdatedAt = DateTime.UtcNow;

            await _courseRepository.UpdateCourseAsync(courseExist);

            // Update Course Content and Lessons logic goes here

            var courseContentExist = await _courseContentRepository.GetCourseContentByCourseIdAsync(courseId) ??
                throw new KeyNotFoundException("Course content not found");
            courseContentExist.Title = fullCourseDto.CourseContent.Title;
            courseContentExist.Description = fullCourseDto.CourseContent.Description;
            courseContentExist.Introduce = fullCourseDto.CourseContent.Introduce;

            await _courseContentRepository.UpdateCourseContentAsync(courseContentExist);

            var existingLessons = await _lessonRepository.GetLessonsByCourseContentIdAsync(courseContentExist.Id);

            var lessonsToUpdate = new List<Lesson>();
            var lessonsToAdd = new List<Lesson>();
            foreach (var lessonDto in fullCourseDto.CourseContent.Lessons)
            {
                if (lessonDto.Id == null || string.IsNullOrEmpty(lessonDto.Id))
                {
                    var newLesson = new Lesson
                    {
                        CourseContentId = courseContentExist.Id,
                        Title = lessonDto.Title,
                        VideoUrl = lessonDto.VideoUrl,
                        Order = lessonDto.Order,
                        Duration = lessonDto.Duration,
                        TextContent = lessonDto.TextContent
                    };
                    lessonsToAdd.Add(newLesson);
                }
                else
                {
                    var existingLesson = existingLessons.FirstOrDefault(l => l.Id == lessonDto.Id);
                    if (existingLesson != null)
                    {
                        existingLesson.Title = lessonDto.Title;
                        existingLesson.VideoUrl = lessonDto.VideoUrl;
                        existingLesson.Order = lessonDto.Order;
                        existingLesson.Duration = lessonDto.Duration;
                        existingLesson.TextContent = lessonDto.TextContent;

                        lessonsToUpdate.Add(existingLesson);
                    }
                }
            }
            if (lessonsToAdd.Count > 0)
            {
                await _lessonRepository.AddMultiLessonsAsync(lessonsToAdd);
            }
            if (lessonsToUpdate.Count > 0)
            {
                await _lessonRepository.UpdateMultiLessonsAsync(lessonsToUpdate);
            }

            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task RequestPublishCourseAsync(string teacherId, string courseId)
    {
        var courseExist = await _courseRepository.GetCourseByStatusAsync(courseId, DRAFT_STATUS) ??
            throw new KeyNotFoundException("Course not found");
        if (!courseExist.Status.Equals(DRAFT_STATUS, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new InvalidOperationException("Only draft courses can request publish");
        }
        var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
        if (courseExist.TeacherId != teacherId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }
        courseExist.Status = PENDING_STATUS;

        await _courseRepository.UpdateCourseAsync(courseExist);
    }

    public async Task<PageResultInstructorCoursesDTO> GetCoursesByTeacherIdAsync(string teacherId, string? keyword, string? status, string? sort, int page, int pageSize)
    {
        try
        {
            var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
            if (!await _teacherRepository.IsTeacherExistsAsync(teacherId))
            {
                throw new KeyNotFoundException("Teacher not found");
            }
            var (courses, totalCourses) = await _courseRepository.GetCoursesByTeacherIdAsync(teacherId, keyword, status, sort, page, pageSize);
            var courseResult = courses.Select(c => new CourseInformationDTO
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Price = c.Price,
                DiscountPrice = c.DiscountPrice,
                Status = c.Status,
                ThumbnailUrl = c.ThumbnailUrl,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                AverageRating = c.AverageRating,
                ReviewCount = c.ReviewCount,
                CategoryId = c.CategoryId,
                CategoryName = c.Category.Name,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.User.FullName,
                EnrollmentCount = c.Enrollments.Count,
                ReviewByAdminName = c.AdminReviewCourse?.Admin?.User?.FullName,
                RejectReason = c.AdminReviewCourse?.Reason,
                ReviewStatus = c.AdminReviewCourse?.Status,
            });

            var InstructorStatisticDTO = new InstructorStatisticDTO
            {
                TotalCourses = totalCourses,
                TotalPublishedCourses = courses.Count(c => c.Status == PUBLISHED_STATUS),
                TotalDraftCourses = courses.Count(c => c.Status == DRAFT_STATUS),
                TotalPendingCourses = courses.Count(c => c.Status == PENDING_STATUS),
                TotalRejectedCourses = courses.Count(c => c.Status == REJECTED_STATUS),
                TotalEnrollments = courses.Sum(c => c.Enrollments.Count)
            };

            return new PageResultInstructorCoursesDTO
            {
                Courses = courseResult,
                Statistics = InstructorStatisticDTO,
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = totalCourses,
                TotalPages = (int)Math.Ceiling((double)totalCourses / pageSize)
            };
        }
        catch (Exception ex)
        {
            throw new Exception("Error when retriev course: ", ex);
        }
    }

    public async Task<PageResultCourseEnrollmentDTO> GetEnrolledCoursesByStudentIdAsync(string studentId, string? keyword, string? status, string? sort, int page, int pageSize)
    {
        try
        {
            var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
            if (!await _studentRepository.IsStudentExistAsync(studentId))
            {
                throw new KeyNotFoundException("Student not found");
            }
            var (courses, totalCourses) = await _courseRepository.GetEnrolledCoursesByStudentIdAsync(studentId, keyword, status, sort, page, pageSize);
            var courseResult = courses.Select(c => new CourseEnrollmentInforDTO
            {
                Id = c.Course.Id,
                Title = c.Course.Title,
                Description = c.Course.Description,
                Price = c.Course.Price,
                DiscountPrice = c.Course.DiscountPrice,
                Status = c.Course.Status,
                ThumbnailUrl = c.Course.ThumbnailUrl,
                CreatedAt = c.Course.CreatedAt,
                UpdatedAt = c.Course.UpdatedAt,
                AverageRating = c.Course.AverageRating,
                ReviewCount = c.Course.ReviewCount,
                CategoryId = c.Course.CategoryId,
                CategoryName = c.Course.Category.Name,
                TeacherId = c.Course.TeacherId,
                TeacherName = c.Course.Teacher.User.FullName,
                Progress = (double)c.Progress
            });

            return new PageResultCourseEnrollmentDTO
            {
                Courses = courseResult,
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = totalCourses,
                TotalPages = (int)Math.Ceiling((double)totalCourses / pageSize)
            };
        }
        catch (Exception ex)
        {
            throw new Exception("Error when retriev enrolled courses: ", ex);

        }
    }

    public async Task AddFullCourseAsync(string userId, FullCourseCreateDTO fullCourseDto)
    {
        if (!await _teacherRepository.IsTeacherExistsAsync(userId))
        {
            throw new KeyNotFoundException("Teacher not found");
        }

        var category = await _categoryRepository.GetCategoryByIdAsync(fullCourseDto.CategoryId)
            ?? throw new KeyNotFoundException($"Category with id {fullCourseDto.CategoryId} not found.");


        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var course = new Course
            {
                Title = fullCourseDto.Title,
                Description = fullCourseDto.Description,
                CategoryId = fullCourseDto.CategoryId,
                TeacherId = userId,
                Price = (decimal)fullCourseDto.Price,
                DiscountPrice = (decimal?)fullCourseDto.Discount,
                ThumbnailUrl = fullCourseDto.Thumbnail,
                Status = DRAFT_STATUS,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _courseRepository.AddCourseAsync(course);

            var courseContent = new CourseContent
            {
                CourseId = course.Id,
                Title = fullCourseDto.CourseContent.Title,
                Description = fullCourseDto.CourseContent.Description,
                Introduce = fullCourseDto.CourseContent.Introduce,
            };

            await _courseContentRepository.AddCourseContentAsync(courseContent);

            List<Lesson> lessons = new List<Lesson>();
            foreach (var lessonDto in fullCourseDto.CourseContent.Lessons)
            {
                var lesson = new Lesson
                {
                    CourseContentId = courseContent.Id,
                    Title = lessonDto.Title,
                    VideoUrl = lessonDto.VideoUrl,
                    Order = lessonDto.Order,
                    Duration = lessonDto.Duration,
                    TextContent = lessonDto.TextContent
                };
                lessons.Add(lesson);
            }

            await _lessonRepository.AddMultiLessonsAsync(lessons);
            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<FullCourseUpdateDTO> GetFullCourseDataForEditAsync(string userId, string courseId)
    {
        if (!await _teacherRepository.IsTeacherExistsAsync(userId))
        {
            throw new KeyNotFoundException("Teacher not found");
        }

        var course = await _courseRepository.GetCourseByIdByTeacherAsync(courseId, userId)
            ?? throw new KeyNotFoundException("Course not found");

        if (course.TeacherId != userId)
        {
            throw new UnauthorizedAccessException("You are not the teacher of this course");
        }

        var courseContent = await _courseContentRepository.GetCourseContentByCourseIdAsync(courseId)
            ?? throw new KeyNotFoundException("Course content not found");

        var lessons = await _lessonRepository.GetLessonsByCourseContentIdAsync(courseContent.Id);

        var fullCourseDto = new FullCourseUpdateDTO
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            CategoryId = course.CategoryId,
            Price = (double)course.Price,
            Discount = (double?)course.DiscountPrice,
            Thumbnail = course.ThumbnailUrl,
            CourseContent = new FullCourseContentUpdateDTO
            {
                Id = courseContent.Id,
                Title = courseContent.Title,
                Description = courseContent.Description,
                Introduce = courseContent.Introduce,
                Lessons = lessons.Select(l => new LessonUpdateDTO
                {
                    Id = l.Id,
                    Title = l.Title,
                    VideoUrl = l.VideoUrl,
                    Order = l.Order,
                    Duration = l.Duration,
                    TextContent = l.TextContent
                }).ToList().OrderBy(l => l.Order).ToList()
            }
        };

        return fullCourseDto;
    }
}