using FluentAssertions;
using Moq;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using project.Models;

namespace project.Tests.Modules.Exams
{
    public class ExamServiceTests
    {
        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_01
        // [Mục đích]:
        // Đảm bảo AddExamAsync ném lỗi khi thời lượng bài thi <= 0.
        // Đây là business rule quan trọng vì DurationMinutes không hợp lệ sẽ phá vỡ flow làm bài.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAsync_ShouldThrowArgumentException_WhenDurationMinutesIsNotPositive()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidExamDto = new CreateExamDTO
            {
                Title = "Invalid Duration Exam",
                DurationMinutes = 0,
                CourseContentId = Guid.NewGuid().ToString()
            };

            // Act
            Func<Task> act = () => examService.AddExamAsync(Guid.NewGuid().ToString(), invalidExamDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("DurationMinutes must be greater than zero.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_02
        // [Mục đích]:
        // Đảm bảo AddExamAsync ném lỗi khi đồng thời truyền cả CourseContentId và LessonId.
        // Rule này tránh ambiguity về nơi gắn exam.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAsync_ShouldThrowArgumentException_WhenBothCourseContentIdAndLessonIdAreProvided()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidExamDto = new CreateExamDTO
            {
                Title = "Ambiguous Exam",
                DurationMinutes = 30,
                CourseContentId = Guid.NewGuid().ToString(),
                LessonId = Guid.NewGuid().ToString()
            };

            // Act
            Func<Task> act = () => examService.AddExamAsync(Guid.NewGuid().ToString(), invalidExamDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Only one of CourseContentId or LessonId should be provided.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_03
        // [Mục đích]:
        // Kiểm tra nhánh happy path của AddExamAsync:
        // - [CheckDB] Exam mới phải được ghi xuống DB đúng dữ liệu.
        // - [Rollback] Sau test phải dọn DB về trạng thái trước test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAsync_ShouldCreateExamInDatabase_WhenInputIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(AddExamAsync_ShouldCreateExamInDatabase_WhenInputIsValid));
            var examRepository = new ExamRepository(dbContext);
            var examService = new ExamService(
                examRepository,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var expectedTitle = "Final Exam - Unit Test";
            var expectedDescription = "Validate DB insert logic";
            var expectedDuration = 45;
            var expectedCourseContentId = Guid.NewGuid().ToString();

            var createExamDto = new CreateExamDTO
            {
                Title = expectedTitle,
                Description = expectedDescription,
                DurationMinutes = expectedDuration,
                CourseContentId = expectedCourseContentId
            };

            try
            {
                // Act
                await examService.AddExamAsync(Guid.NewGuid().ToString(), createExamDto);

                // Assert - [CheckDB]
                var savedExam = dbContext.Exams.Single(e => e.Title == expectedTitle);
                savedExam.Description.Should().Be(expectedDescription);
                savedExam.DurationMinutes.Should().Be(expectedDuration);
                savedExam.CourseContentId.Should().Be(expectedCourseContentId);
                savedExam.IsOpened.Should().BeFalse();
                savedExam.TotalCompleted.Should().Be(0);
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_04
        // [Mục đích]:
        // Đảm bảo UpdateExamAsync chặn việc chuyển từ opened -> closed (rule hiện tại của code).
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateExamAsync_ShouldThrowInvalidOperationException_WhenTryToCloseOpenedExam()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var existingExam = new Exam
            {
                Id = examId,
                Title = "Opened Exam",
                DurationMinutes = 40,
                IsOpened = true
            };

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(existingExam);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var updateExamDto = new UpdateExamDTO
            {
                Title = "Updated Title",
                DurationMinutes = 60,
                IsOpened = false
            };

            // Act
            Func<Task> act = () => examService.UpdateExamAsync(Guid.NewGuid().ToString(), examId, updateExamDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot update to an opened exam.");
            examRepositoryMock.Verify(r => r.UpdateExamAsync(It.IsAny<Exam>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_05
        // [Mục đích]:
        // Đảm bảo UpdateOrderQuestionInExamAsync ném lỗi khi danh sách question gửi lên
        // không khớp tập câu hỏi thực tế trong exam.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateOrderQuestionInExamAsync_ShouldThrowException_WhenQuestionListDoesNotMatch()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionIdInDb1 = Guid.NewGuid().ToString();
            var questionIdInDb2 = Guid.NewGuid().ToString();
            var unexpectedQuestionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Reorder",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var questionExamServiceMock = new Mock<IQuestionExamService>();
            questionExamServiceMock.Setup(s => s.GetQuestionExamOrderAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExamOrderDTO { Id = questionIdInDb1, Order = 1 },
                    new QuestionExamOrderDTO { Id = questionIdInDb2, Order = 2 }
                ]);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                questionExamServiceMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidQuestionOrderPayload = new List<QuestionExamOrderDTO>
            {
                new QuestionExamOrderDTO { Id = questionIdInDb1, Order = 1 },
                new QuestionExamOrderDTO { Id = unexpectedQuestionId, Order = 2 }
            };

            // Act
            Func<Task> act = () => examService.UpdateOrderQuestionInExamAsync(Guid.NewGuid().ToString(), examId, invalidQuestionOrderPayload);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Question list does not match the exam.");
            examRepositoryMock.Verify(r => r.UpdateOrderQuestionInExamAsync(It.IsAny<string>(), It.IsAny<List<QuestionExam>>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_06
        // [Mục đích]:
        // Đảm bảo GetExamByIdAsync từ chối truy cập exam private khi chưa đăng nhập (userId null/rỗng).
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamByIdAsync_ShouldThrowUnauthorizedAccessException_WhenUserIdIsMissingForPrivateExam()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Private Exam",
                    DurationMinutes = 25,
                    CourseContentId = Guid.NewGuid().ToString()
                });

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamByIdAsync(null!, examId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You need to be logged in to access this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_07
        // [Mục đích]:
        // Đảm bảo AddExamAsync ném lỗi khi Title rỗng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAsync_ShouldThrowArgumentException_WhenTitleIsEmpty()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidExamDto = new CreateExamDTO
            {
                Title = " ",
                DurationMinutes = 30,
                CourseContentId = Guid.NewGuid().ToString()
            };

            // Act
            Func<Task> act = () => examService.AddExamAsync(Guid.NewGuid().ToString(), invalidExamDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Title cannot be null or empty.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_08
        // [Mục đích]:
        // Đảm bảo AddExamAsync ném lỗi khi không truyền cả CourseContentId và LessonId.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAsync_ShouldThrowArgumentException_WhenCourseContentIdAndLessonIdAreMissing()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidExamDto = new CreateExamDTO
            {
                Title = "Exam Without Target",
                DurationMinutes = 30
            };

            // Act
            Func<Task> act = () => examService.AddExamAsync(Guid.NewGuid().ToString(), invalidExamDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Either CourseContentId or LessonId must be provided.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_09
        // [Mục đích]:
        // Đảm bảo GetExamByIdAsync trả dữ liệu exam public ngay cả khi userId thiếu.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamByIdAsync_ShouldReturnExam_WhenExamIsPublicAndUserIdIsMissing()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Public Exam",
                    Description = "Public exam description",
                    DurationMinutes = 20,
                    IsOpened = true,
                    TotalCompleted = 7,
                    CourseContentId = null,
                    LessonId = null
                });

            var studentRepositoryMock = new Mock<IStudentRepository>();
            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                studentRepositoryMock.Object,
                Mock.Of<ICourseContentRepository>(),
                enrollmentRepositoryMock.Object,
                dbContext);

            // Act
            var result = await examService.GetExamByIdAsync(null!, examId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(examId);
            result.Title.Should().Be("Public Exam");
            result.CourseId.Should().BeNull();
            studentRepositoryMock.Verify(r => r.GetStudentByUserIdAsync(It.IsAny<string>()), Times.Never);
            enrollmentRepositoryMock.Verify(r => r.IsEnrollmentExistAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_10
        // [Mục đích]:
        // Đảm bảo GetExamByIdAsync ném unauthorized khi student không enroll vào course chứa exam.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamByIdAsync_ShouldThrowUnauthorizedAccessException_WhenStudentIsNotEnrolled()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();
            var studentId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Private Course Exam",
                    DurationMinutes = 35,
                    CourseContentId = courseContentId
                });

            var studentRepositoryMock = new Mock<IStudentRepository>();
            studentRepositoryMock.Setup(r => r.GetStudentByUserIdAsync(userId))
                .ReturnsAsync(new project.Models.Student
                {
                    StudentId = studentId,
                    UserId = userId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new project.Models.CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Course Content For Enrollment Check"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(false);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                studentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                enrollmentRepositoryMock.Object,
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamByIdAsync(userId, examId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not enrolled in the course associated with this exam*");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_11
        // [Mục đích]:
        // Đảm bảo UpdateExamAsync cập nhật dữ liệu thành công khi input hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateExamAsync_ShouldPersistUpdatedFields_WhenInputIsValid()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var existingExam = new Exam
            {
                Id = examId,
                Title = "Old Title",
                Description = "Old Description",
                DurationMinutes = 30,
                IsOpened = false
            };

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(existingExam);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var updateExamDto = new UpdateExamDTO
            {
                Title = "New Title",
                Description = "New Description",
                DurationMinutes = 75,
                IsOpened = true
            };

            // Act
            await examService.UpdateExamAsync(Guid.NewGuid().ToString(), examId, updateExamDto);

            // Assert
            examRepositoryMock.Verify(r => r.UpdateExamAsync(It.Is<Exam>(e =>
                e.Id == examId &&
                e.Title == "New Title" &&
                e.Description == "New Description" &&
                e.DurationMinutes == 75 &&
                e.IsOpened == true)), Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_12
        // [Mục đích]:
        // Đảm bảo UpdateOrderQuestionInExamAsync cập nhật thứ tự câu hỏi khi payload hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateOrderQuestionInExamAsync_ShouldUpdateQuestionOrders_WhenPayloadMatchesExamQuestions()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionId1 = Guid.NewGuid().ToString();
            var questionId2 = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Order Update",
                    DurationMinutes = 45,
                    IsOpened = false
                });

            var questionExamServiceMock = new Mock<IQuestionExamService>();
            questionExamServiceMock.Setup(s => s.GetQuestionExamOrderAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExamOrderDTO { Id = questionId1, Order = 1 },
                    new QuestionExamOrderDTO { Id = questionId2, Order = 2 }
                ]);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                questionExamServiceMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var validPayload = new List<QuestionExamOrderDTO>
            {
                new QuestionExamOrderDTO { Id = questionId1, Order = 2 },
                new QuestionExamOrderDTO { Id = questionId2, Order = 1 }
            };

            // Act
            await examService.UpdateOrderQuestionInExamAsync(Guid.NewGuid().ToString(), examId, validPayload);

            // Assert
            examRepositoryMock.Verify(r => r.UpdateOrderQuestionInExamAsync(
                examId,
                It.Is<List<QuestionExam>>(items =>
                    items.Count == 2 &&
                    items.Any(i => i.Id == questionId1 && i.Order == 2 && i.ExamId == examId) &&
                    items.Any(i => i.Id == questionId2 && i.Order == 1 && i.ExamId == examId))),
                Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_13
        // [Mục đích]:
        // Đảm bảo GetAllExamsAsync ánh xạ đúng entity từ repository sang DTO.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllExamsAsync_ShouldReturnMappedDtos_WhenRepositoryReturnsData()
        {
            // Arrange
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetAllExamsAsync())
                .ReturnsAsync(
                [
                    new Exam { Id = "exam-1", Title = "Exam 1", Description = "D1", DurationMinutes = 30, TotalCompleted = 2, IsOpened = true, CourseContentId = "cc-1" },
                    new Exam { Id = "exam-2", Title = "Exam 2", Description = "D2", DurationMinutes = 45, TotalCompleted = 0, IsOpened = false, LessonId = "lesson-1" }
                ]);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            var result = (await examService.GetAllExamsAsync()).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Single(x => x.Id == "exam-1").Title.Should().Be("Exam 1");
            result.Single(x => x.Id == "exam-2").LessonId.Should().Be("lesson-1");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_14
        // [Mục đích]:
        // Đảm bảo GetExamsByCourseIdAsync ném lỗi khi không tìm thấy course của teacher.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsByCourseIdAsync_ShouldThrowKeyNotFoundException_WhenCourseNotFoundForTeacher()
        {
            // Arrange
            var teacherId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var courseRepositoryMock = new Mock<ICourseRepository>();
            courseRepositoryMock.Setup(r => r.GetCourseByIdByTeacherAsync(courseId, teacherId))
                .ReturnsAsync((project.Models.Course?)null);

            var examRepositoryMock = new Mock<IExamRepository>();

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                courseRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamsByCourseIdAsync(teacherId, courseId, null, null, null, 1, 10);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Course with id: {courseId} not found for teacher with id: {teacherId}.");
            examRepositoryMock.Verify(r => r.GetExamsByCourseIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_15
        // [Mục đích]:
        // Đảm bảo GetExamsByCourseIdAsync trả về kết quả phân trang với các field được ánh xạ đúng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsByCourseIdAsync_ShouldReturnPagedResult_WhenInputIsValid()
        {
            // Arrange
            var teacherId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var courseRepositoryMock = new Mock<ICourseRepository>();
            courseRepositoryMock.Setup(r => r.GetCourseByIdByTeacherAsync(courseId, teacherId))
                .ReturnsAsync(new project.Models.Course
                {
                    Id = courseId,
                    Title = "Course A",
                    CategoryId = Guid.NewGuid().ToString(),
                    TeacherId = teacherId,
                    Status = "published"
                });

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamsByCourseIdAsync(teacherId, courseId, "mid", "opened", "asc", 1, 2))
                .ReturnsAsync((
                [
                    new Exam
                    {
                        Id = "exam-1",
                        Title = "Mid Term",
                        Description = "Description",
                        DurationMinutes = 60,
                        TotalCompleted = 5,
                        IsOpened = true,
                        CourseContentId = "cc-1",
                        CourseContent = new project.Models.CourseContent
                        {
                            Id = "cc-1",
                            CourseId = courseId,
                            Title = "Content",
                            Course = new project.Models.Course
                            {
                                Id = courseId,
                                Title = "Course A",
                                CategoryId = Guid.NewGuid().ToString(),
                                TeacherId = teacherId,
                                Status = "published"
                            }
                        }
                    }
                ],
                3));

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                courseRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            var result = await examService.GetExamsByCourseIdAsync(teacherId, courseId, "mid", "opened", "asc", 1, 2);

            // Assert
            result.Items.Should().HaveCount(1);
            result.TotalCount.Should().Be(3);
            result.TotalPages.Should().Be(2);
            result.CurrentPage.Should().Be(1);
            result.PageSize.Should().Be(2);
            result.Items.Single().CourseTitle.Should().Be("Course A");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_16
        // [Mục đích]:
        // Đảm bảo GetExamsInCourseAsync ném lỗi khi course không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsInCourseAsync_ShouldThrowKeyNotFoundException_WhenCourseDoesNotExist()
        {
            // Arrange
            var courseId = Guid.NewGuid().ToString();
            var courseRepositoryMock = new Mock<ICourseRepository>();
            courseRepositoryMock.Setup(r => r.CourseExistsAsync(courseId))
                .ReturnsAsync(false);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                courseRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamsInCourseAsync(courseId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Course with id: {courseId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_17
        // [Mục đích]:
        // Đảm bảo GetExamsInCourseAsync trả về danh sách exam đã ánh xạ khi course tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsInCourseAsync_ShouldReturnMappedExams_WhenCourseExists()
        {
            // Arrange
            var courseId = Guid.NewGuid().ToString();
            var courseRepositoryMock = new Mock<ICourseRepository>();
            courseRepositoryMock.Setup(r => r.CourseExistsAsync(courseId)).ReturnsAsync(true);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamsInCourseAsync(courseId))
                .ReturnsAsync(
                [
                    new Exam { Id = "exam-1", Title = "Course Exam", DurationMinutes = 30, CourseContentId = "cc-1", IsOpened = true }
                ]);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                courseRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            var result = (await examService.GetExamsInCourseAsync(courseId)).ToList();

            // Assert
            result.Should().ContainSingle();
            result.Single().Id.Should().Be("exam-1");
            result.Single().CourseContentId.Should().Be("cc-1");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_18
        // [Mục đích]:
        // Đảm bảo GetExamsInLessonAsync ném lỗi khi lesson không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsInLessonAsync_ShouldThrowKeyNotFoundException_WhenLessonDoesNotExist()
        {
            // Arrange
            var lessonId = Guid.NewGuid().ToString();
            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.LessonExistsAsync(lessonId))
                .ReturnsAsync(false);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                lessonRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamsInLessonAsync(Guid.NewGuid().ToString(), lessonId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Lesson with id: {lessonId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_19
        // [Mục đích]:
        // Đảm bảo GetExamsInLessonAsync trả về danh sách exam đã ánh xạ khi lesson tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamsInLessonAsync_ShouldReturnMappedExams_WhenLessonExists()
        {
            // Arrange
            var lessonId = Guid.NewGuid().ToString();
            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.LessonExistsAsync(lessonId))
                .ReturnsAsync(true);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamsInLessonAsync(lessonId))
                .ReturnsAsync(
                [
                    new Exam { Id = "exam-lesson-1", Title = "Lesson Exam", DurationMinutes = 20, LessonId = lessonId, IsOpened = false }
                ]);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                lessonRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            var result = (await examService.GetExamsInLessonAsync(Guid.NewGuid().ToString(), lessonId)).ToList();

            // Assert
            result.Should().ContainSingle();
            result.Single().LessonId.Should().Be(lessonId);
            result.Single().Title.Should().Be("Lesson Exam");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_20
        // [Mục đích]:
        // Đảm bảo AddFullExamAsync validate lỗi khi thiếu cả CourseContentId và LessonId.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddFullExamAsync_ShouldThrowArgumentException_WhenCourseContentIdAndLessonIdAreMissing()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidDto = new CreateFullExamDTO
            {
                Title = "Full Exam",
                DurationMinutes = 45,
                Questions = []
            };

            // Act
            Func<Task> act = () => examService.AddFullExamAsync(Guid.NewGuid().ToString(), invalidDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Either CourseContentId or LessonId must be provided.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_21
        // [Mục đích]:
        // Đảm bảo AddFullExamAsync validate lỗi khi truyền đồng thời CourseContentId và LessonId.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddFullExamAsync_ShouldThrowArgumentException_WhenBothCourseContentIdAndLessonIdAreProvided()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                Mock.Of<IExamRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var invalidDto = new CreateFullExamDTO
            {
                Title = "Full Exam",
                DurationMinutes = 45,
                CourseContentId = Guid.NewGuid().ToString(),
                LessonId = Guid.NewGuid().ToString(),
                Questions = []
            };

            // Act
            Func<Task> act = () => examService.AddFullExamAsync(Guid.NewGuid().ToString(), invalidDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Only one of CourseContentId or LessonId should be provided.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_22
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi ExamId rỗng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowArgumentException_WhenExamIdIsEmpty()
        {
            // Arrange
            var examService = CreateExamServiceForUpload();
            var request = new UploadExamExcelRequest
            {
                ExamId = " ",
                File = CreateTextFormFile("dummy", "questions.xlsx")
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Exam ID cannot be null or empty.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_23
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi ExamId sai định dạng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowArgumentException_WhenExamIdFormatIsInvalid()
        {
            // Arrange
            var examService = CreateExamServiceForUpload();
            var request = new UploadExamExcelRequest
            {
                ExamId = "not-a-guid",
                File = CreateTextFormFile("dummy", "questions.xlsx")
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Invalid Exam ID format.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_24
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi thiếu file upload.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowArgumentException_WhenFileIsMissing()
        {
            // Arrange
            var examService = CreateExamServiceForUpload();
            var request = new UploadExamExcelRequest
            {
                ExamId = Guid.NewGuid().ToString(),
                File = null!
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Excel file is required.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_25
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync từ chối file có phần mở rộng không được hỗ trợ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowArgumentException_WhenFileExtensionIsInvalid()
        {
            // Arrange
            var examRepositoryMock = new Mock<IExamRepository>();
            var examService = CreateExamServiceForUpload(examRepositoryMock: examRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = Guid.NewGuid().ToString(),
                File = CreateTextFormFile("plain-text", "questions.txt")
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Invalid file format. Only .xlsx and .xls files are supported.");
            examRepositoryMock.Verify(r => r.GetExamByIdAsync(It.IsAny<string>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_26
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync chặn upload vào exam đang mở.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenExamIsOpened()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Opened Exam",
                    DurationMinutes = 30,
                    IsOpened = true
                });

            var examService = CreateExamServiceForUpload(examRepositoryMock: examRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    ws.Cell(1, 1).Value = "Index";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot upload questions to an opened exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_27
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi header thiếu cột bắt buộc.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenHeaderIsMissingRequiredColumn()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Upload",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var examService = CreateExamServiceForUpload(examRepositoryMock: examRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    ws.Cell(1, 1).Value = "Index";
                    ws.Cell(1, 2).Value = "Content";
                    ws.Cell(1, 3).Value = "Type";
                    ws.Cell(1, 4).Value = "Point";
                    ws.Cell(1, 5).Value = "Is Required";
                    ws.Cell(1, 6).Value = "Order";
                    ws.Cell(1, 7).Value = "Choices";
                    // Missing "Is Correct"
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Missing required column 'Is Correct' in header.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_28
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync ném lỗi khi worksheet không có dòng câu hỏi.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenNoQuestionsFoundInFile()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Upload",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var examService = CreateExamServiceForUpload(examRepositoryMock: examRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws => WriteRequiredHeader(ws))
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("No questions were found in the Excel file.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_29
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync ném lỗi khi một câu hỏi không có lựa chọn nào.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenQuestionHasNoChoices()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Upload",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var examService = CreateExamServiceForUpload(examRepositoryMock: examRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);
                    ws.Cell(2, 1).Value = "1";
                    ws.Cell(2, 2).Value = "Question without choices";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "1";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "1";
                    ws.Cell(2, 7).Value = "";
                    ws.Cell(2, 8).Value = "";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Question 'Question without choices' has no choices.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_30
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync parse file Excel hợp lệ và gửi danh sách câu hỏi vào repository.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldUploadParsedQuestions_WhenExcelIsValid()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Upload",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var questionExamRepositoryMock = new Mock<IQuestionExamRepository>();
            var examService = CreateExamServiceForUpload(examRepositoryMock, questionExamRepositoryMock);

            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);

                    // Question 1, choice A
                    ws.Cell(2, 1).Value = "1";
                    ws.Cell(2, 2).Value = "Question 1";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "2";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "1";
                    ws.Cell(2, 7).Value = "Answer A";
                    ws.Cell(2, 8).Value = "true";

                    // Same question, choice B
                    ws.Cell(3, 1).Value = "";
                    ws.Cell(3, 2).Value = "";
                    ws.Cell(3, 3).Value = "";
                    ws.Cell(3, 4).Value = "";
                    ws.Cell(3, 5).Value = "";
                    ws.Cell(3, 6).Value = "";
                    ws.Cell(3, 7).Value = "Answer B";
                    ws.Cell(3, 8).Value = "false";
                })
            };

            // Act
            await examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            questionExamRepositoryMock.Verify(r => r.UploadBulkQuestionsAsync(
                It.Is<IEnumerable<QuestionExam>>(questions =>
                    questions.Count() == 1 &&
                    questions.Single().Content == "Question 1" &&
                    questions.Single().Choices.Count == 2 &&
                    questions.Single().Choices.Any(c => c.Content == "Answer A" && c.IsCorrect == true) &&
                    questions.Single().Choices.Any(c => c.Content == "Answer B" && c.IsCorrect == false))),
                Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_31
        // [Mục đích]:
        // Đảm bảo GetExamByIdAsync resolve exam gắn với lesson và trả về course id khi student đã enroll.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamByIdAsync_ShouldReturnPrivateLessonExam_WhenStudentIsEnrolled()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Exam",
                    Description = "Private lesson exam",
                    DurationMinutes = 35,
                    TotalCompleted = 4,
                    IsOpened = true,
                    LessonId = lessonId
                });

            var studentRepositoryMock = new Mock<IStudentRepository>();
            studentRepositoryMock.Setup(r => r.GetStudentByUserIdAsync(userId))
                .ReturnsAsync(new Student { StudentId = studentId, UserId = userId });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(new Lesson { Id = lessonId, CourseContentId = courseContentId, Title = "Lesson" });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new CourseContent { Id = courseContentId, CourseId = courseId, Title = "Content" });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(true);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                lessonRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                studentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                enrollmentRepositoryMock.Object,
                dbContext);

            // Act
            var result = await examService.GetExamByIdAsync(userId, examId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(examId);
            result.CourseId.Should().Be(courseId);
            result.LessonId.Should().Be(lessonId);
            result.CourseContentId.Should().BeNull();
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_32
        // [Mục đích]:
        // Đảm bảo GetExamByIdAsync ném lỗi khi exam private không resolve được course liên quan.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamByIdAsync_ShouldThrowKeyNotFoundException_WhenAssociatedCourseCannotBeResolved()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Course Exam",
                    DurationMinutes = 30,
                    CourseContentId = courseContentId
                });

            var studentRepositoryMock = new Mock<IStudentRepository>();
            studentRepositoryMock.Setup(r => r.GetStudentByUserIdAsync(userId))
                .ReturnsAsync(new Student { StudentId = studentId, UserId = userId });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync((CourseContent?)null);

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                studentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.GetExamByIdAsync(userId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_33
        // [Mục đích]:
        // Đảm bảo AddFullExamAsync lưu exam cùng các câu hỏi/lựa chọn lồng bên trong.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddFullExamAsync_ShouldPersistExamQuestionsAndChoices_WhenInputIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(AddFullExamAsync_ShouldPersistExamQuestionsAndChoices_WhenInputIsValid));
            var examRepository = new ExamRepository(dbContext);
            var questionExamRepository = new QuestionExamRepository(dbContext);
            var examService = new ExamService(
                examRepository,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                questionExamRepository,
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var courseContentId = Guid.NewGuid().ToString();
            var fullExamDto = new CreateFullExamDTO
            {
                Title = "Full Exam",
                Description = "Created with nested data",
                DurationMinutes = 45,
                CourseContentId = courseContentId,
                Questions =
                [
                    new CreateFullQuestionExamDTO
                    {
                        Content = "Question 1",
                        Explanation = "Explanation 1",
                        ImageUrl = "https://example.test/image.png",
                        IsRequired = true,
                        Score = 2,
                        Order = 1,
                        Type = "SingleChoice",
                        Answers =
                        [
                            new AddChoiceDTO { Content = "A", IsCorrect = true },
                            new AddChoiceDTO { Content = "B", IsCorrect = false }
                        ]
                    }
                ]
            };

            try
            {
                // Act
                await examService.AddFullExamAsync(Guid.NewGuid().ToString(), fullExamDto);

                // Assert - [CheckDB]
                var savedExam = dbContext.Exams.Single(e => e.Title == "Full Exam");
                savedExam.CourseContentId.Should().Be(courseContentId);
                savedExam.IsOpened.Should().BeFalse();

                var savedQuestion = dbContext.QuestionExams.Single(q => q.ExamId == savedExam.Id);
                savedQuestion.Content.Should().Be("Question 1");
                savedQuestion.Exaplanation.Should().Be("Explanation 1");
                savedQuestion.ImageUrl.Should().Be("https://example.test/image.png");
                savedQuestion.Score.Should().Be(2);
                savedQuestion.IsNewest.Should().BeTrue();

                var savedChoices = dbContext.Choices.Where(c => c.QuestionExamId == savedQuestion.Id).ToList();
                savedChoices.Should().HaveCount(2);
                savedChoices.Should().Contain(c => c.Content == "A" && c.IsCorrect == true);
                savedChoices.Should().Contain(c => c.Content == "B" && c.IsCorrect == false);
            }
            finally
            {
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_34
        // [Mục đích]:
        // Đảm bảo AddFullExamAsync rollback và ném lại lỗi khi upload bulk câu hỏi thất bại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddFullExamAsync_ShouldRethrowException_WhenQuestionUploadFails()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.AddExamAsync(It.IsAny<Exam>()))
                .Returns(Task.CompletedTask);

            var questionExamRepositoryMock = new Mock<IQuestionExamRepository>();
            questionExamRepositoryMock.Setup(r => r.UploadBulkQuestionsAsync(It.IsAny<IEnumerable<QuestionExam>>()))
                .ThrowsAsync(new InvalidOperationException("Bulk upload failed"));

            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                questionExamRepositoryMock.Object,
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            var fullExamDto = new CreateFullExamDTO
            {
                Title = "Full Exam",
                DurationMinutes = 45,
                CourseContentId = Guid.NewGuid().ToString(),
                Questions =
                [
                    new CreateFullQuestionExamDTO
                    {
                        Content = "Question 1",
                        Explanation = "Explanation 1",
                        IsRequired = true,
                        Score = 1,
                        Order = 1,
                        Type = "SingleChoice",
                        Answers = [new AddChoiceDTO { Content = "A", IsCorrect = true }]
                    }
                ]
            };

            // Act
            Func<Task> act = () => examService.AddFullExamAsync(Guid.NewGuid().ToString(), fullExamDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Bulk upload failed");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_35
        // [Mục đích]:
        // Đảm bảo UpdateOrderQuestionInExamAsync chặn cập nhật thứ tự câu hỏi của exam đang mở.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateOrderQuestionInExamAsync_ShouldThrowInvalidOperationException_WhenExamIsOpened()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Opened Exam",
                    DurationMinutes = 30,
                    IsOpened = true
                });

            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            var examService = new ExamService(
                examRepositoryMock.Object,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);

            // Act
            Func<Task> act = () => examService.UpdateOrderQuestionInExamAsync(Guid.NewGuid().ToString(), examId, []);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot update question order for an opened exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_36
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi index câu hỏi không hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenQuestionIndexIsInvalid()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examService = CreateExamServiceForClosedExamUpload(examId);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);
                    ws.Cell(2, 1).Value = "abc";
                    ws.Cell(2, 2).Value = "Question 1";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "1";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "1";
                    ws.Cell(2, 7).Value = "Answer A";
                    ws.Cell(2, 8).Value = "true";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Invalid Index at row 2: 'abc'.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_37
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi nội dung câu hỏi bắt buộc bị rỗng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenQuestionContentIsEmpty()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examService = CreateExamServiceForClosedExamUpload(examId);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);
                    ws.Cell(2, 1).Value = "1";
                    ws.Cell(2, 2).Value = " ";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "1";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "1";
                    ws.Cell(2, 7).Value = "Answer A";
                    ws.Cell(2, 8).Value = "true";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Content is required for question index 1 (row 2).");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_38
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi điểm số không hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenPointIsInvalid()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examService = CreateExamServiceForClosedExamUpload(examId);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);
                    ws.Cell(2, 1).Value = "1";
                    ws.Cell(2, 2).Value = "Question 1";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "bad";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "1";
                    ws.Cell(2, 7).Value = "Answer A";
                    ws.Cell(2, 8).Value = "true";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Invalid number in column 'Point' at row 2: 'bad'.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_39
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync validate lỗi khi thứ tự không phải số nguyên hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldThrowInvalidOperationException_WhenOrderIsInvalid()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var examService = CreateExamServiceForClosedExamUpload(examId);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);
                    ws.Cell(2, 1).Value = "1";
                    ws.Cell(2, 2).Value = "Question 1";
                    ws.Cell(2, 3).Value = "SingleChoice";
                    ws.Cell(2, 4).Value = "1";
                    ws.Cell(2, 5).Value = "true";
                    ws.Cell(2, 6).Value = "bad";
                    ws.Cell(2, 7).Value = "Answer A";
                    ws.Cell(2, 8).Value = "true";
                })
            };

            // Act
            Func<Task> act = () => examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Invalid integer in column 'Order' at row 2: 'bad'.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_ES_40
        // [Mục đích]:
        // Đảm bảo UploadExamExcelAsync bỏ qua các dòng trống trước câu hỏi đầu tiên.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UploadExamExcelAsync_ShouldSkipLeadingBlankRowsAndUploadValidQuestions()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionExamRepositoryMock = new Mock<IQuestionExamRepository>();
            var examService = CreateExamServiceForClosedExamUpload(examId, questionExamRepositoryMock);
            var request = new UploadExamExcelRequest
            {
                ExamId = examId,
                File = CreateExcelFormFile("questions.xlsx", ws =>
                {
                    WriteRequiredHeader(ws);

                    ws.Cell(2, 7).Value = "Ignored choice";
                    ws.Cell(2, 8).Value = "true";

                    ws.Cell(3, 1).Value = "1";
                    ws.Cell(3, 2).Value = "Question 1";
                    ws.Cell(3, 3).Value = "";
                    ws.Cell(3, 4).Value = "";
                    ws.Cell(3, 5).Value = "";
                    ws.Cell(3, 6).Value = "";
                    ws.Cell(3, 7).Value = "Answer A";
                    ws.Cell(3, 8).Value = "maybe";
                })
            };

            // Act
            await examService.UploadExamExcelAsync(Guid.NewGuid().ToString(), request);

            // Assert
            questionExamRepositoryMock.Verify(r => r.UploadBulkQuestionsAsync(
                It.Is<IEnumerable<QuestionExam>>(questions =>
                    questions.Count() == 1 &&
                    questions.Single().Type == "MultiSelectChoice" &&
                    questions.Single().Score == 1.0 &&
                    questions.Single().IsRequired == false &&
                    questions.Single().Order == null &&
                    questions.Single().Choices.Single().Content == "Answer A" &&
                    questions.Single().Choices.Single().IsCorrect == null)),
                Times.Once);
        }

        private static ExamService CreateExamServiceForUpload(
            Mock<IExamRepository>? examRepositoryMock = null,
            Mock<IQuestionExamRepository>? questionExamRepositoryMock = null)
        {
            var examRepository = examRepositoryMock?.Object ?? Mock.Of<IExamRepository>();
            var questionExamRepository = questionExamRepositoryMock?.Object ?? Mock.Of<IQuestionExamRepository>();

            var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext();
            return new ExamService(
                examRepository,
                Mock.Of<IQuestionExamService>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                questionExamRepository,
                Mock.Of<IStudentRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                dbContext);
        }

        private static ExamService CreateExamServiceForClosedExamUpload(
            string examId,
            Mock<IQuestionExamRepository>? questionExamRepositoryMock = null)
        {
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Closed Exam",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            return CreateExamServiceForUpload(examRepositoryMock, questionExamRepositoryMock);
        }

        private static IFormFile CreateTextFormFile(string text, string fileName)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(text);
            var stream = new MemoryStream(bytes);
            return new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/octet-stream"
            };
        }

        private static IFormFile CreateExcelFormFile(string fileName, Action<IXLWorksheet> arrangeWorksheet)
        {
            var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Sheet1");
            arrangeWorksheet(worksheet);

            var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
        }

        private static void WriteRequiredHeader(IXLWorksheet ws)
        {
            ws.Cell(1, 1).Value = "Index";
            ws.Cell(1, 2).Value = "Content";
            ws.Cell(1, 3).Value = "Type";
            ws.Cell(1, 4).Value = "Point";
            ws.Cell(1, 5).Value = "Is Required";
            ws.Cell(1, 6).Value = "Order";
            ws.Cell(1, 7).Value = "Choices";
            ws.Cell(1, 8).Value = "Is Correct";
        }
    }
}
