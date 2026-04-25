using FluentAssertions;
using Moq;
using project.Models;

namespace project.Tests.Modules.Exams
{
    public class ExamAttempServiceTests
    {
        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_01
        // [Mục đích]:
        // Đảm bảo AddExamAttempAsync trả về attempt hiện có nếu student còn active attempt.
        // Không tạo thêm attempt mới để tránh duplicate phiên thi.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldReturnExistingAttempt_WhenActiveAttemptAlreadyExists()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var activeAttempt = new ExamAttemp
            {
                Id = Guid.NewGuid().ToString(),
                StudentId = studentId,
                ExamId = examId,
                AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                StartTime = DateTime.UtcNow.AddMinutes(-5),
                EndTime = DateTime.UtcNow.AddMinutes(25),
                IsSubmitted = false
            };

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(activeAttempt);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Mock Exam",
                    DurationMinutes = 30
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                examRepositoryMock.Object);

            // Act
            var result = await examAttempService.AddExamAttempAsync(studentId, examId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(activeAttempt.Id);
            examAttempRepositoryMock.Verify(r => r.AddExamAttempAsync(It.IsAny<ExamAttemp>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_02
        // [Mục đích]:
        // Đảm bảo AddExamAttempAsync ném UnauthorizedAccessException khi exam thuộc course/lesson
        // nhưng student chưa enroll vào course đó.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldThrowUnauthorizedAccessException_WhenStudentIsNotEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync((ExamAttemp?)null);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Course Exam",
                    DurationMinutes = 40,
                    CourseContentId = courseContentId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Course Content"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(false);

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                courseContentRepositoryMock.Object,
                enrollmentRepositoryMock.Object,
                examRepositoryMock.Object);

            // Act
            Func<Task> act = () => examAttempService.AddExamAttempAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not enrolled in the course associated with this exam*");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_03
        // [Mục đích]:
        // Kiểm tra nhánh happy path của AddExamAttempAsync:
        // - [CheckDB] Attempt mới được ghi đúng vào DB.
        // - [Rollback] Sau test dọn DB về trạng thái trước test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldCreateNewAttemptInDatabase_WhenInputIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(AddExamAttempAsync_ShouldCreateNewAttemptInDatabase_WhenInputIsValid));
            var examAttempRepository = new ExamAttempRepository(dbContext);

            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var examDuration = 50;

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Public Exam",
                    DurationMinutes = examDuration
                });

            var examAttempService = new ExamAttempService(
                examAttempRepository,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                examRepositoryMock.Object);

            try
            {
                // Act
                var createdAttempt = await examAttempService.AddExamAttempAsync(studentId, examId);

                // Assert - [CheckDB]
                createdAttempt.Should().NotBeNull();
                var savedAttempt = dbContext.ExamAttemps.Single(a => a.Id == createdAttempt!.Id);

                savedAttempt.StudentId.Should().Be(studentId);
                savedAttempt.ExamId.Should().Be(examId);
                savedAttempt.IsSubmitted.Should().BeFalse();
                savedAttempt.EndTime.Should().BeAfter(savedAttempt.StartTime);
                savedAttempt.EndTime.Should().BeOnOrBefore(savedAttempt.StartTime.AddMinutes(examDuration).AddSeconds(1));
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_04
        // [Mục đích]:
        // Đảm bảo SaveExamAnswersAsync chặn việc lưu đáp án khi attempt đã submitted hoặc hết hạn.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldThrowInvalidOperationException_WhenAttemptIsSubmitted()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = Guid.NewGuid().ToString(),
                    StartTime = DateTime.UtcNow.AddMinutes(-30),
                    EndTime = DateTime.UtcNow.AddMinutes(30),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-30),
                    IsSubmitted = true
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.SaveExamAnswersAsync(studentId, attemptId, "[{\"questionId\":\"q1\"}]");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot save answers for a submitted or expired exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_05
        // [Mục đích]:
        // Kiểm tra SaveExamAnswersAsync cập nhật SavedAnswers đúng DB:
        // - [CheckDB] Dữ liệu đáp án mới được lưu vào bảng ExamAttemps.
        // - [Rollback] Sau test dọn DB về trạng thái trước test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldPersistSavedAnswers_WhenAttemptIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(SaveExamAnswersAsync_ShouldPersistSavedAnswers_WhenAttemptIsValid));
            var examAttempRepository = new ExamAttempRepository(dbContext);

            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var savedAnswerPayload = "[{\"questionId\":\"q1\",\"choices\":[{\"id\":\"c1\"}]}]";

            dbContext.ExamAttemps.Add(new ExamAttemp
            {
                Id = attemptId,
                StudentId = studentId,
                ExamId = Guid.NewGuid().ToString(),
                StartTime = DateTime.UtcNow.AddMinutes(-5),
                EndTime = DateTime.UtcNow.AddMinutes(30),
                AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                IsSubmitted = false,
                SavedAnswers = null
            });
            await dbContext.SaveChangesAsync();

            var examAttempService = new ExamAttempService(
                examAttempRepository,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            try
            {
                // Act
                await examAttempService.SaveExamAnswersAsync(studentId, attemptId, savedAnswerPayload);

                // Assert - [CheckDB]
                var updatedAttempt = dbContext.ExamAttemps.Single(a => a.Id == attemptId);
                updatedAttempt.SavedAnswers.Should().Be(savedAnswerPayload);
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_06
        // [Mục đích]:
        // Đảm bảo GetExamAttempByIdAsync ném lỗi unauthorized khi student cố đọc attempt của người khác.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamAttempByIdAsync_ShouldThrowUnauthorizedAccessException_WhenStudentDoesNotOwnAttempt()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var otherStudentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = otherStudentId,
                    ExamId = Guid.NewGuid().ToString(),
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(30),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.GetExamAttempByIdAsync(studentId, attemptId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not authorized to access this exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_07
        // [Mục đích]:
        // Đảm bảo AddExamAttempAsync ném lỗi khi exam không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync((Exam?)null);

            var examAttempService = new ExamAttempService(
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                examRepositoryMock.Object);

            // Act
            Func<Task> act = () => examAttempService.AddExamAttempAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam with id {examId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_08
        // [Mục đích]:
        // Đảm bảo AddExamAttempAsync ném lỗi khi không resolve được course từ CourseContent.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldThrowKeyNotFoundException_WhenAssociatedCourseIsMissing()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync((ExamAttemp?)null);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Private Exam",
                    DurationMinutes = 30,
                    CourseContentId = courseContentId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync((CourseContent?)null);

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                courseContentRepositoryMock.Object,
                Mock.Of<IEnrollmentCourseRepository>(),
                examRepositoryMock.Object);

            // Act
            Func<Task> act = () => examAttempService.AddExamAttempAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_09
        // [Mục đích]:
        // Đảm bảo AddExamAttempAsync xử lý đúng nhánh exam gắn Lesson và student đã enroll.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddExamAttempAsync_ShouldCreateAttempt_WhenExamBelongsToLessonAndStudentEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync((ExamAttemp?)null);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Exam",
                    DurationMinutes = 25,
                    LessonId = lessonId
                });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(new Lesson
                {
                    Id = lessonId,
                    CourseContentId = courseContentId,
                    Title = "Lesson A"
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Content A"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(true);

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                lessonRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                enrollmentRepositoryMock.Object,
                examRepositoryMock.Object);

            // Act
            var result = await examAttempService.AddExamAttempAsync(studentId, examId);

            // Assert
            result.Should().NotBeNull();
            result!.StudentId.Should().Be(studentId);
            result.ExamId.Should().Be(examId);
            examAttempRepositoryMock.Verify(r => r.AddExamAttempAsync(It.IsAny<ExamAttemp>()), Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_10
        // [Mục đích]:
        // Đảm bảo SaveExamAnswersAsync ném lỗi khi attempt không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldThrowKeyNotFoundException_WhenAttemptDoesNotExist()
        {
            // Arrange
            var attemptId = Guid.NewGuid().ToString();
            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync((ExamAttemp?)null);

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.SaveExamAnswersAsync(Guid.NewGuid().ToString(), attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam attempt with id {attemptId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_11
        // [Mục đích]:
        // Đảm bảo SaveExamAnswersAsync chặn student khác chỉnh sửa attempt.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldThrowUnauthorizedAccessException_WhenStudentDoesNotOwnAttempt()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var otherStudentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = otherStudentId,
                    ExamId = Guid.NewGuid().ToString(),
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(20),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.SaveExamAnswersAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not authorized to save answers for this exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_12
        // [Mục đích]:
        // Đảm bảo SaveExamAnswersAsync chặn lưu khi attempt đã hết hạn.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldThrowInvalidOperationException_WhenAttemptExpired()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = Guid.NewGuid().ToString(),
                    StartTime = DateTime.UtcNow.AddMinutes(-30),
                    EndTime = DateTime.UtcNow.AddMinutes(-1),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-30),
                    IsSubmitted = false
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.SaveExamAnswersAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot save answers for a submitted or expired exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_13
        // [Mục đích]:
        // Đảm bảo SaveExamAnswersAsync chặn lưu khi attempt chưa đến thời gian bắt đầu.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task SaveExamAnswersAsync_ShouldThrowInvalidOperationException_WhenAttemptNotStartedYet()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = Guid.NewGuid().ToString(),
                    StartTime = DateTime.UtcNow.AddMinutes(5),
                    EndTime = DateTime.UtcNow.AddMinutes(40),
                    AttemptedAt = DateTime.UtcNow,
                    IsSubmitted = false
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.SaveExamAnswersAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot save answers for a submitted or expired exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_14
        // [Mục đích]:
        // Đảm bảo GetExamAttempByIdAsync ném lỗi khi attempt không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamAttempByIdAsync_ShouldThrowKeyNotFoundException_WhenAttemptDoesNotExist()
        {
            // Arrange
            var attemptId = Guid.NewGuid().ToString();
            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync((ExamAttemp?)null);

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => examAttempService.GetExamAttempByIdAsync(Guid.NewGuid().ToString(), attemptId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam attempt with id {attemptId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_EAS_15
        // [Mục đích]:
        // Đảm bảo GetExamAttempByIdAsync trả DTO đúng khi student sở hữu attempt.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetExamAttempByIdAsync_ShouldReturnAttemptDto_WhenStudentOwnsAttempt()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var attemptedAt = DateTime.UtcNow.AddMinutes(-10);
            var startTime = DateTime.UtcNow.AddMinutes(-10);
            var endTime = DateTime.UtcNow.AddMinutes(20);

            var examAttempRepositoryMock = new Mock<IExamAttempRepository>();
            examAttempRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = Guid.NewGuid().ToString(),
                    AttemptedAt = attemptedAt,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsSubmitted = false,
                    SavedAnswers = "[]",
                    SubmittedAt = DateTime.MinValue
                });

            var examAttempService = new ExamAttempService(
                examAttempRepositoryMock.Object,
                Mock.Of<ICourseRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            var result = await examAttempService.GetExamAttempByIdAsync(studentId, attemptId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(attemptId);
            result.StudentId.Should().Be(studentId);
            result.AttemptedAt.Should().Be(attemptedAt);
            result.StartTime.Should().Be(startTime);
            result.EndTime.Should().Be(endTime);
            result.SavedAnswers.Should().Be("[]");
        }
    }
}
