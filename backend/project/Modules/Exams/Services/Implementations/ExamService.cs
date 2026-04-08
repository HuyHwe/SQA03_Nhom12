using System.Globalization;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using project.Models;

public class ExamService : IExamService
{
    private readonly IExamRepository _examRepository;
    private readonly IQuestionExamService _questionExamService;
    private readonly ICourseRepository _courseRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IQuestionExamRepository _questionExamRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly ICourseContentRepository _courseContentRepository;
    private readonly IEnrollmentCourseRepository _enrollmentCourseRepository;
    private readonly DBContext _dbContext;

    public ExamService(
        IExamRepository examRepository,
        IQuestionExamService questionExamService,
        ICourseRepository courseRepository,
        ILessonRepository lessonRepository,
        IQuestionExamRepository questionExamRepository,
        IStudentRepository studentRepository,
        ICourseContentRepository courseContentRepository,
        IEnrollmentCourseRepository enrollmentCourseRepository,
        DBContext dbContext)
    {
        _examRepository = examRepository;
        _questionExamService = questionExamService;
        _courseRepository = courseRepository;
        _lessonRepository = lessonRepository;
        _questionExamRepository = questionExamRepository;
        _studentRepository = studentRepository;
        _courseContentRepository = courseContentRepository;
        _enrollmentCourseRepository = enrollmentCourseRepository;
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<InformationExamDTO>> GetAllExamsAsync()
    {
        var exams = await _examRepository.GetAllExamsAsync();
        return exams.Select(exam => new InformationExamDTO
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            TotalCompleted = exam.TotalCompleted,
            IsOpened = exam.IsOpened,
            CourseContentId = exam.CourseContentId,
            LessonId = exam.LessonId
        });
    }

    public async Task<PageResultExamTeacherDTO> GetExamsByCourseIdAsync(string teacherId, string courseId, string? keyword, string? status, string? sort, int page, int pageSize)
    {
        var teacherGuid = GuidHelper.ParseOrThrow(teacherId, nameof(teacherId));
        var courseGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));

        var courseExist = await _courseRepository.GetCourseByIdByTeacherAsync(courseId, teacherId) ?? throw new KeyNotFoundException($"Course with id: {courseId} not found for teacher with id: {teacherId}.");
        var (exams, totalCount) = await _examRepository.GetExamsByCourseIdAsync(teacherId, courseId, keyword, status, sort, page, pageSize);

        var examResult = exams.Select(exam => new InformationExamDTO
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            TotalCompleted = exam.TotalCompleted,
            IsOpened = exam.IsOpened,
            CourseContentId = exam.CourseContentId,
            LessonId = exam.LessonId,
            CourseTitle = exam.CourseContent?.Course.Title,
            LessonTitle = exam.Lesson?.Title
        });
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        return new PageResultExamTeacherDTO
        {
            Items = examResult,
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<IEnumerable<InformationExamDTO>> GetExamsInCourseAsync(string courseId)
    {
        var courseGuid = GuidHelper.ParseOrThrow(courseId, nameof(courseId));
        var courseExist = await _courseRepository.CourseExistsAsync(courseId);
        if (!courseExist)
        {
            throw new KeyNotFoundException($"Course with id: {courseId} not found.");
        }

        var exams = await _examRepository.GetExamsInCourseAsync(courseId);
        return exams.Select(e => new InformationExamDTO
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            DurationMinutes = e.DurationMinutes,
            TotalCompleted = e.TotalCompleted,
            IsOpened = e.IsOpened,
            CourseContentId = e.CourseContentId,
            LessonId = e.LessonId
        });
    }

    public async Task<IEnumerable<InformationExamDTO>> GetExamsInLessonAsync(string studentId, string lessonId)
    {
        var lessonGuid = GuidHelper.ParseOrThrow(lessonId, nameof(lessonId));
        var lessonExist = await _lessonRepository.LessonExistsAsync(lessonId);
        if (!lessonExist)
        {
            throw new KeyNotFoundException($"Lesson with id: {lessonId} not found.");
        }

        var exams = await _examRepository.GetExamsInLessonAsync(lessonId);
        return exams.Select(e => new InformationExamDTO
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            DurationMinutes = e.DurationMinutes,
            TotalCompleted = e.TotalCompleted,
            IsOpened = e.IsOpened,
            CourseContentId = e.CourseContentId,
            LessonId = e.LessonId
        });
    }

    public async Task<InformationExamDTO?> GetExamByIdAsync(string userId, string id)
    {
        var exam = await _examRepository.GetExamByIdAsync(id) ?? throw new KeyNotFoundException($"Exam with id {id} not found.");
        if (exam.CourseContentId != null || exam.LessonId != null)
        {
            if (userId == null || string.IsNullOrWhiteSpace(userId))
            {
                throw new UnauthorizedAccessException("You need to be logged in to access this exam.");
            }
            else
            {
                var student = await _studentRepository.GetStudentByUserIdAsync(userId);
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
                var isEnrolled = await _enrollmentCourseRepository.IsEnrollmentExistAsync(student.StudentId, courseId);
                if (!isEnrolled)
                {
                    throw new UnauthorizedAccessException($"You are not enrolled in the course associated with this exam. {student.StudentId}, {courseId} ");
                }
                return new InformationExamDTO
                {
                    Id = exam.Id,
                    Title = exam.Title,
                    Description = exam.Description,
                    DurationMinutes = exam.DurationMinutes,
                    TotalCompleted = exam.TotalCompleted,
                    IsOpened = exam.IsOpened,
                    CourseContentId = exam.CourseContentId,
                    LessonId = exam.LessonId,
                    CourseId = courseId
                };
            }
        }
        return new InformationExamDTO
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            TotalCompleted = exam.TotalCompleted,
            IsOpened = exam.IsOpened,
            CourseContentId = exam.CourseContentId,
            LessonId = exam.LessonId
        };
    }

    public async Task AddExamAsync(string userId, CreateExamDTO exam)
    {
        if (exam.DurationMinutes <= 0)
        {
            throw new ArgumentException("DurationMinutes must be greater than zero.");
        }
        if (string.IsNullOrWhiteSpace(exam.Title))
        {
            throw new ArgumentException("Title cannot be null or empty.");
        }
        if (exam.CourseContentId == null && exam.LessonId == null)
        {
            throw new ArgumentException("Either CourseContentId or LessonId must be provided.");
        }
        if (exam.CourseContentId != null && exam.LessonId != null)
        {
            throw new ArgumentException("Only one of CourseContentId or LessonId should be provided.");
        }
        var newExam = new Exam
        {
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            TotalCompleted = 0,
            IsOpened = false,
            CourseContentId = exam.CourseContentId,
            LessonId = exam.LessonId
        };
        await _examRepository.AddExamAsync(newExam);
    }

    public async Task AddFullExamAsync(string userId, CreateFullExamDTO fullExamDto)
    {
        if (fullExamDto.CourseContentId == null && fullExamDto.LessonId == null)
        {
            throw new ArgumentException("Either CourseContentId or LessonId must be provided.");
        }
        if (fullExamDto.CourseContentId != null && fullExamDto.LessonId != null)
        {
            throw new ArgumentException("Only one of CourseContentId or LessonId should be provided.");
        }

        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var newExam = new Exam
            {
                Title = fullExamDto.Title,
                Description = fullExamDto.Description,
                DurationMinutes = fullExamDto.DurationMinutes,
                TotalCompleted = 0,
                IsOpened = false,
                CourseContentId = fullExamDto.CourseContentId,
                LessonId = fullExamDto.LessonId
            };

            await _examRepository.AddExamAsync(newExam);

            List<QuestionExam> questions = new List<QuestionExam>();
            foreach (var questionDto in fullExamDto.Questions)
            {
                var newQuestion = new QuestionExam
                {
                    Id = Guid.NewGuid().ToString(),
                    ExamId = newExam.Id,
                    Content = questionDto.Content,
                    Type = questionDto.Type,
                    Exaplanation = questionDto.Explanation,
                    ImageUrl = questionDto.ImageUrl,
                    Score = questionDto.Score,
                    IsRequired = questionDto.IsRequired,
                    Order = questionDto.Order,
                    IsNewest = true
                };

                foreach (var choiceDto in questionDto.Answers)
                {
                    var newChoice = new Choice
                    {
                        Id = Guid.NewGuid().ToString(),
                        Content = choiceDto.Content,
                        IsCorrect = choiceDto.IsCorrect,
                        QuestionExamId = newQuestion.Id
                    };
                    newQuestion.Choices.Add(newChoice);
                }

                questions.Add(newQuestion);
            }

            await _questionExamRepository.UploadBulkQuestionsAsync(questions);
            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }

    }

    public async Task UpdateExamAsync(string userId, string examId, UpdateExamDTO examUpdate)
    {
        var exam = await _examRepository.GetExamByIdAsync(examId) ?? throw new KeyNotFoundException($"Exam with id {examId} not found.");
        if (exam.IsOpened == true && examUpdate.IsOpened == false)
        {
            throw new InvalidOperationException("Cannot update to an opened exam.");
        }
        exam.Title = examUpdate.Title ?? exam.Title;
        exam.Description = examUpdate.Description ?? exam.Description;
        exam.DurationMinutes = examUpdate.DurationMinutes >= 0 ? examUpdate.DurationMinutes : exam.DurationMinutes;
        exam.IsOpened = examUpdate.IsOpened;
        await _examRepository.UpdateExamAsync(exam);
    }

    // public async Task DeleteExamAsync(int id)
    // {

    // }

    public async Task UpdateOrderQuestionInExamAsync(string userId, string examId, List<QuestionExamOrderDTO> questionOrders)
    {
        var exam = await _examRepository.GetExamByIdAsync(examId) ?? throw new KeyNotFoundException($"Exam with id {examId} not found.");

        if (exam.IsOpened)
            throw new InvalidOperationException("Cannot update question order for an opened exam.");

        var questions = await _questionExamService.GetQuestionExamOrderAsync(examId);

        var questionIdsFromDb = questions.Select(q => q.Id).ToHashSet();
        var questionIdsFromDto = questionOrders.Select(q => q.Id).ToHashSet();

        if (!questionIdsFromDb.SetEquals(questionIdsFromDto))
            throw new Exception("Question list does not match the exam.");

        var updatedEntities = questionOrders.Select(q => new QuestionExam
        {
            Id = q.Id,
            ExamId = examId,
            Order = q.Order
        }).ToList();

        await _examRepository.UpdateOrderQuestionInExamAsync(examId, updatedEntities);
    }


    // Upload questions from Excel file
    public async Task UploadExamExcelAsync(string userId, UploadExamExcelRequest request)
    {
        var examId = request.ExamId;
        var excelFile = request.File;
        // Validate
        if (string.IsNullOrWhiteSpace(examId))
        {
            throw new ArgumentException("Exam ID cannot be null or empty.");
        }
        if (!Guid.TryParse(examId, out var examGuid))
        {
            throw new ArgumentException("Invalid Exam ID format.");
        }
        if (excelFile == null || excelFile.Length == 0)
        {
            throw new ArgumentException("Excel file is required.");
        }

        var extension = Path.GetExtension(excelFile.FileName).ToLowerInvariant();
        if (extension != ".xlsx" && extension != ".xls")
        {
            throw new ArgumentException("Invalid file format. Only .xlsx and .xls files are supported.");
        }

        var exam = await _examRepository.GetExamByIdAsync(examId) ?? throw new KeyNotFoundException($"Exam with id {examId} not found.");
        if (exam.IsOpened)
        {
            throw new InvalidOperationException("Cannot upload questions to an opened exam.");
        }

        // Process Excel file
        using var stream = excelFile.OpenReadStream();
        using var workbook = new XLWorkbook(stream);
        var ws = workbook.Worksheets.FirstOrDefault() ?? throw new ArgumentException("The Excel file does not contain any worksheets.");

        // Mapping
        var headerRowNumber = ws.FirstRowUsed()?.RowNumber() ?? 1;
        var headerRow = ws.Row(headerRowNumber);
        var lastCol = ws.LastColumnUsed()?.ColumnNumber() ?? headerRow.LastCellUsed()?.Address.ColumnNumber ?? 1;

        var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (int c = 1; c <= lastCol; c++)
        {
            var name = headerRow.Cell(c).GetString().Trim();
            if (!string.IsNullOrEmpty(name) && !colMap.ContainsKey(name))
                colMap[name] = c;
        }

        string[] requiredCols =
        [
            "Index", "Content", "Type", "Point", "Is Required", "Order", "Choices", "Is Correct"
        ];
        foreach (var rc in requiredCols)
        {
            if (!colMap.ContainsKey(rc))
                throw new InvalidOperationException($"Missing required column '{rc}' in header.");
        }

        var questionsByIndex = new Dictionary<int, QuestionExam>();
        var lastRow = ws.LastRowUsed().RowNumber();

        QuestionExam? currentQuestion = null;
        int? currentIndex = null;

        for (int r = headerRowNumber + 1; r <= lastRow; r++)
        {
            var row = ws.Row(r);
            var idxStr = row.Cell(colMap["Index"]).GetString().Trim();
            var startsNewQuestion = !string.IsNullOrWhiteSpace(idxStr);
            if (startsNewQuestion)
            {
                if (!int.TryParse(idxStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var qIndex))
                    throw new InvalidOperationException($"Invalid Index at row {r}: '{idxStr}'.");

                currentIndex = qIndex;

                if (!questionsByIndex.TryGetValue(qIndex, out currentQuestion))
                {
                    var content = row.Cell(colMap["Content"]).GetString().Trim();
                    if (string.IsNullOrWhiteSpace(content))
                        throw new InvalidOperationException($"Content is required for question index {qIndex} (row {r}).");

                    var type = row.Cell(colMap["Type"]).GetString().Trim();
                    var explanation = colMap.TryGetValue("Explanation", out var exCol) ? row.Cell(exCol).GetString().Trim() : string.Empty;
                    var imageUrl = colMap.TryGetValue("Image Url", out var imgCol) ? row.Cell(imgCol).GetString().Trim() : null;

                    var pointStr = row.Cell(colMap["Point"]).GetString();
                    var isRequiredStr = row.Cell(colMap["Is Required"]).GetString();
                    var orderStr = row.Cell(colMap["Order"]).GetString();

                    var score = ParseNullableDouble(pointStr, r, "Point") ?? 1.0;
                    var isRequired = ParseBool(isRequiredStr, r, "Is Required");
                    var order = ParseNullableInt(orderStr, r, "Order");

                    currentQuestion = new QuestionExam
                    {
                        Id = Guid.NewGuid().ToString(),
                        ExamId = examId,
                        Content = content,
                        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl,
                        Type = string.IsNullOrWhiteSpace(type) ? "MultiSelectChoice" : type,
                        Exaplanation = explanation ?? string.Empty,
                        Score = score,
                        IsRequired = isRequired,
                        Order = order,
                        IsNewest = true
                    };

                    questionsByIndex[qIndex] = currentQuestion;
                }
            }
            else
            {
                if (currentQuestion is null || currentIndex is null)
                    continue;
            }

            var choiceText = row.Cell(colMap["Choices"]).GetString().Trim();
            var isCorrectRaw = row.Cell(colMap["Is Correct"]).GetString().Trim();

            if (!string.IsNullOrWhiteSpace(choiceText))
            {
                currentQuestion!.Choices.Add(new Choice
                {
                    Id = Guid.NewGuid().ToString(),
                    Content = choiceText,
                    IsCorrect = ParseNullableBool(isCorrectRaw)
                });
            }
        }

        var questions = questionsByIndex.Values.ToList();
        if (questions.Count == 0)
            throw new InvalidOperationException("No questions were found in the Excel file.");

        // Optional validation: at least one choice per question
        foreach (var q in questions)
        {
            if (q.Choices == null || q.Choices.Count == 0)
                throw new InvalidOperationException($"Question '{q.Content}' has no choices.");
        }

        // Persist to DB: implement this method in your question service/repository to bulk insert
        // await _questionExamService.AddQuestionsWithChoicesAsync(examId, questions);
        await _questionExamRepository.UploadBulkQuestionsAsync(questions);
    }

    private static int? ParseNullableInt(string? raw, int row, string col)
    {
        if (string.IsNullOrWhiteSpace(raw)) return (int?)null;
        if (int.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out var v)) return v;
        throw new InvalidOperationException($"Invalid integer in column '{col}' at row {row}: '{raw}'.");
    }

    private static double? ParseNullableDouble(string? raw, int row, string col)
    {
        if (string.IsNullOrWhiteSpace(raw)) return (double?)null;
        if (double.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out var v)) return v;
        throw new InvalidOperationException($"Invalid number in column '{col}' at row {row}: '{raw}'.");
    }

    private static bool ParseBool(string? raw, int row, string col)
    {
        var b = ParseNullableBool(raw);
        if (b.HasValue) return b.Value;
        // Treat empty as false; change as needed
        return false;
    }

    private static bool? ParseNullableBool(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return (bool?)null;
        var s = raw.Trim().ToLowerInvariant();
        return s switch
        {
            "1" or "true" or "yes" or "y" or "x" => true,
            "0" or "false" or "no" or "n" => false,
            _ => (bool?)null
        };
    }
}