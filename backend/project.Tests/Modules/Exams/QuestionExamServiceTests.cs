using FluentAssertions;
using Moq;

namespace project.Tests.Modules.Exams
{
    public class QuestionExamServiceTests
    {
        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_01
        // [Mục đích]:
        // Đảm bảo AddQuestionToExamAsync ném lỗi khi exam không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddQuestionToExamAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(It.IsAny<string>()))
                .ReturnsAsync((false, false));

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            var questionDto = new CreateQuestionExamDTO
            {
                Content = "Question content",
                Type = "SingleChoice",
                Exaplanation = "Question explanation",
                Score = 1
            };

            // Act
            Func<Task> act = () => questionExamService.AddQuestionToExamAsync(Guid.NewGuid().ToString(), Guid.NewGuid().ToString(), questionDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Exam with ID*does not exist.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_02
        // [Mục đích]:
        // Đảm bảo AddQuestionToExamAsync ném lỗi khi exam đã opened.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddQuestionToExamAsync_ShouldThrowInvalidOperationException_WhenExamIsOpened()
        {
            // Arrange
            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(It.IsAny<string>()))
                .ReturnsAsync((true, true));

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            var questionDto = new CreateQuestionExamDTO
            {
                Content = "Question content",
                Type = "SingleChoice",
                Exaplanation = "Question explanation",
                Score = 1
            };

            // Act
            Func<Task> act = () => questionExamService.AddQuestionToExamAsync(Guid.NewGuid().ToString(), Guid.NewGuid().ToString(), questionDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot add question to an opened exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_03
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném lỗi khi student chưa có active attempt.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowInvalidOperationException_WhenNoActiveAttempt()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Exam For Attempt Check",
                    DurationMinutes = 30
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync((ExamAttemp?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("No active attempt found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_04
        // [Mục đích]:
        // Đảm bảo GetQuestionExamOrderAsync chỉ trả về question có IsNewest = true.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionExamOrderAsync_ShouldReturnOnlyNewestQuestions()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionsByExamIdAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExam { Id = "q1", ExamId = examId, IsNewest = true, Order = 1, Content = "Q1", Type = "Single", Exaplanation = "E1" },
                    new QuestionExam { Id = "q2", ExamId = examId, IsNewest = false, Order = 2, Content = "Q2", Type = "Single", Exaplanation = "E2" },
                    new QuestionExam { Id = "q3", ExamId = examId, IsNewest = true, Order = 3, Content = "Q3", Type = "Single", Exaplanation = "E3" }
                ]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = (await questionExamService.GetQuestionExamOrderAsync(examId)).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Select(x => x.Id).Should().Contain(["q1", "q3"]);
            result.Select(x => x.Id).Should().NotContain("q2");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_05
        // [Mục đích]:
        // Kiểm tra DeleteQuestionExamAsync với DB thật (in-memory):
        // - [CheckDB] Xóa question và toàn bộ choices của question đó.
        // - [Rollback] Dọn DB về trạng thái trước test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteQuestionExamAsync_ShouldDeleteQuestionAndChoices_WhenInputIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(DeleteQuestionExamAsync_ShouldDeleteQuestionAndChoices_WhenInputIsValid));
            var questionRepository = new QuestionExamRepository(dbContext);
            var choiceRepository = new ChoiceRepository(dbContext);
            var unitOfWork = new UnitOfWork(dbContext);

            var examId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            dbContext.QuestionExams.Add(new QuestionExam
            {
                Id = questionId,
                ExamId = examId,
                Content = "Question to delete",
                Type = "SingleChoice",
                Exaplanation = "Explanation",
                IsNewest = true
            });

            dbContext.Choices.AddRange(
                new Choice
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionExamId = questionId,
                    Content = "Choice A",
                    IsCorrect = true
                },
                new Choice
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionExamId = questionId,
                    Content = "Choice B",
                    IsCorrect = false
                });

            await dbContext.SaveChangesAsync();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, false));

            var questionExamService = new QuestionExamService(
                questionRepository,
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                choiceRepository,
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                unitOfWork);

            try
            {
                // Act
                await questionExamService.DeleteQuestionExamAsync(Guid.NewGuid().ToString(), examId, questionId);

                // Assert - [CheckDB]
                dbContext.QuestionExams.Any(q => q.Id == questionId).Should().BeFalse();
                dbContext.Choices.Any(c => c.QuestionExamId == questionId).Should().BeFalse();
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_06
        // [Mục đích]:
        // Đảm bảo AddQuestionToExamAsync tạo mới câu hỏi khi exam tồn tại và chưa opened.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddQuestionToExamAsync_ShouldPersistQuestion_WhenExamExistsAndIsClosed()
        {
            // Arrange
            var userId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, false));

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            var createQuestionDto = new CreateQuestionExamDTO
            {
                Content = "New question content",
                Type = "SingleChoice",
                Exaplanation = "Question explanation",
                Score = 2.0,
                IsRequired = true
            };

            // Act
            await questionExamService.AddQuestionToExamAsync(userId, examId, createQuestionDto);

            // Assert
            questionRepositoryMock.Verify(r => r.AddQuestionToExamAsync(It.Is<QuestionExam>(q =>
                q.ExamId == examId &&
                q.Content == "New question content" &&
                q.Type == "SingleChoice" &&
                q.Exaplanation == "Question explanation" &&
                q.Score == 2.0 &&
                q.IsRequired == true &&
                q.IsNewest == true &&
                q.ParentQuestionId == null)), Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_07
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném unauthorized khi student không enroll.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowUnauthorizedAccessException_WhenStudentIsNotEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Private exam",
                    DurationMinutes = 30,
                    CourseContentId = courseContentId
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(25),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new project.Models.CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Course Content"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(false);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                enrollmentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not enrolled in the course associated with this exam*");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_08
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync trả đủ câu hỏi + choices khi exam public hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldReturnQuestionsWithChoices_WhenInputIsValidForPublicExam()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var questionId1 = Guid.NewGuid().ToString();
            var questionId2 = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Public Exam",
                    DurationMinutes = 25,
                    CourseContentId = null,
                    LessonId = null
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(20),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionsByExamIdAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExam { Id = questionId1, ExamId = examId, Content = "Q1", Type = "SingleChoice", Exaplanation = "E1", Score = 1.0, IsRequired = true, IsNewest = true, Order = 1 },
                    new QuestionExam { Id = questionId2, ExamId = examId, Content = "Q2", Type = "SingleChoice", Exaplanation = "E2", Score = 2.0, IsRequired = false, IsNewest = true, Order = 2 }
                ]);

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForExamByQuestionExamIdAsync(questionId1))
                .ReturnsAsync([new ChoiceForExamDTO { Id = "c1", QuestionExamId = questionId1, Content = "A" }]);
            choiceServiceMock.Setup(s => s.GetChoicesForExamByQuestionExamIdAsync(questionId2))
                .ReturnsAsync([new ChoiceForExamDTO { Id = "c2", QuestionExamId = questionId2, Content = "B" }]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            var result = (await questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId)).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Single(x => x.Id == questionId1).Choices.Should().ContainSingle(c => c.Id == "c1");
            result.Single(x => x.Id == questionId2).Choices.Should().ContainSingle(c => c.Id == "c2");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_09
        // [Mục đích]:
        // Đảm bảo GetQuestionInExamForDoingExamAsync ném lỗi khi question không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionInExamForDoingExamAsync_ShouldThrowKeyNotFoundException_WhenQuestionDoesNotExist()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionInExamAsync(questionId))
                .ReturnsAsync((QuestionExam?)null);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionInExamForDoingExamAsync(questionId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Question with {questionId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_10
        // [Mục đích]:
        // Đảm bảo GetQuestionInExamForReviewSubmissionAsync map dữ liệu question + choice đúng.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionInExamForReviewSubmissionAsync_ShouldReturnQuestionWithChoices_WhenQuestionExists()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionInExamAsync(questionId))
                .ReturnsAsync(new QuestionExam
                {
                    Id = questionId,
                    ExamId = examId,
                    Content = "Review question",
                    Type = "SingleChoice",
                    Exaplanation = "Review explanation",
                    Score = 3.0,
                    IsRequired = true,
                    Order = 1,
                    IsNewest = true
                });

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForReviewByQuestionExamIdAsync(questionId))
                .ReturnsAsync(
                [
                    new ChoiceForReviewDTO { Id = "c1", QuestionExamId = questionId, Content = "A", IsCorrect = true },
                    new ChoiceForReviewDTO { Id = "c2", QuestionExamId = questionId, Content = "B", IsCorrect = false }
                ]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = await questionExamService.GetQuestionInExamForReviewSubmissionAsync(questionId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(questionId);
            result.ExamId.Should().Be(examId);
            result.Explanation.Should().Be("Review explanation");
            result.Choices.Should().HaveCount(2);
            result.Choices.Should().Contain(c => c.Id == "c1" && c.IsCorrect);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_11
        // [Mục đích]:
        // Đảm bảo DeleteQuestionExamAsync chặn sửa dữ liệu khi exam đang opened.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteQuestionExamAsync_ShouldThrowInvalidOperationException_WhenExamIsOpened()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, true));

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            var choiceRepositoryMock = new Mock<IChoiceRepository>();

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                choiceRepositoryMock.Object,
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.DeleteQuestionExamAsync(Guid.NewGuid().ToString(), examId, questionId);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot modify in an opened exam.");
            questionRepositoryMock.Verify(r => r.DeleteQuestionExam(It.IsAny<QuestionExam>()), Times.Never);
            choiceRepositoryMock.Verify(r => r.DeleteChoice(It.IsAny<IEnumerable<Choice>>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_12
        // [Mục đích]:
        // Đảm bảo DeleteQuestionExamAsync ném lỗi khi question không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteQuestionExamAsync_ShouldThrowKeyNotFoundException_WhenQuestionDoesNotExist()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, false));

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionInExamAsync(questionId))
                .ReturnsAsync((QuestionExam?)null);

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                unitOfWorkMock.Object);

            // Act
            Func<Task> act = () => questionExamService.DeleteQuestionExamAsync(Guid.NewGuid().ToString(), examId, questionId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Question with ID '{questionId}' not found.");
            unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_13
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném lỗi khi exam không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync((Exam?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam with ID '{examId}' does not exist.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_14
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném lỗi khi không resolve được course từ Lesson.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowKeyNotFoundException_WhenAssociatedCourseMissingForLessonBasedExam()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Exam",
                    DurationMinutes = 20,
                    LessonId = lessonId
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-2),
                    EndTime = DateTime.UtcNow.AddMinutes(30),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-2),
                    IsSubmitted = false
                });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(new project.Models.Lesson
                {
                    Id = lessonId,
                    CourseContentId = courseContentId,
                    Title = "Lesson A"
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync((project.Models.CourseContent?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                courseContentRepositoryMock.Object,
                lessonRepositoryMock.Object,
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_15
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForReviewSubmissionAsync ném lỗi khi exam không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForReviewSubmissionAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync((Exam?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam with ID '{examId}' does not exist.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_16
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForReviewSubmissionAsync ném unauthorized khi student chưa enroll.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForReviewSubmissionAsync_ShouldThrowUnauthorizedAccessException_WhenStudentIsNotEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Private Exam",
                    DurationMinutes = 20,
                    CourseContentId = courseContentId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new project.Models.CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Content A"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(false);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                enrollmentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not enrolled in the course associated with this exam*");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_17
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForReviewSubmissionAsync trả dữ liệu đúng khi exam public.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForReviewSubmissionAsync_ShouldReturnQuestionsWithChoices_WhenExamIsPublic()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Public Exam",
                    DurationMinutes = 20,
                    CourseContentId = null,
                    LessonId = null
                });

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionsByExamIdAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExam { Id = questionId, ExamId = examId, Content = "Q1", Type = "SingleChoice", Exaplanation = "E1", Score = 1.0, IsRequired = true, Order = 1, IsNewest = true }
                ]);

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForReviewByQuestionExamIdAsync(questionId))
                .ReturnsAsync(
                [
                    new ChoiceForReviewDTO { Id = "c1", QuestionExamId = questionId, Content = "A", IsCorrect = true }
                ]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = (await questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId)).ToList();

            // Assert
            result.Should().ContainSingle();
            result.Single().Choices.Should().ContainSingle(c => c.Id == "c1" && c.IsCorrect);
            result.Single().Explanation.Should().Be("E1");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_18
        // [Mục đích]:
        // Đảm bảo GetQuestionInExamForDoingExamAsync map dữ liệu đúng khi question tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionInExamForDoingExamAsync_ShouldReturnQuestionWithChoices_WhenQuestionExists()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionInExamAsync(questionId))
                .ReturnsAsync(new QuestionExam
                {
                    Id = questionId,
                    ExamId = examId,
                    Content = "Doing Question",
                    Type = "SingleChoice",
                    Exaplanation = "E",
                    Score = 2.0,
                    IsRequired = true,
                    Order = 2,
                    IsNewest = true
                });

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForExamByQuestionExamIdAsync(questionId))
                .ReturnsAsync([new ChoiceForExamDTO { Id = "c1", QuestionExamId = questionId, Content = "A" }]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = await questionExamService.GetQuestionInExamForDoingExamAsync(questionId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(questionId);
            result.ExamId.Should().Be(examId);
            result.Choices.Should().ContainSingle(c => c.Id == "c1");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_19
        // [Mục đích]:
        // Đảm bảo GetQuestionInExamForReviewSubmissionAsync ném lỗi khi question không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionInExamForReviewSubmissionAsync_ShouldThrowKeyNotFoundException_WhenQuestionDoesNotExist()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionInExamAsync(questionId))
                .ReturnsAsync((QuestionExam?)null);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionInExamForReviewSubmissionAsync(questionId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Question with {questionId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_20
        // [Mục đích]:
        // Đảm bảo DeleteQuestionExamAsync ném lỗi khi exam không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteQuestionExamAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var examId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((false, false));

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.DeleteQuestionExamAsync(Guid.NewGuid().ToString(), examId, questionId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam with ID '{examId}' does not exist.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_21
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném lỗi khi exam dùng CourseContent
        // nhưng CourseContent trả về null.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowKeyNotFoundException_WhenCourseContentMissingForCourseBasedExam()
        {
            // Arrange
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

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(20),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync((project.Models.CourseContent?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                courseContentRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_22
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync ném lỗi khi exam dùng Lesson nhưng Lesson không tồn tại.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldThrowKeyNotFoundException_WhenLessonIsMissing()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Exam",
                    DurationMinutes = 30,
                    LessonId = lessonId
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(20),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync((project.Models.Lesson?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                lessonRepositoryMock.Object,
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_23
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForReviewSubmissionAsync ném lỗi khi exam dùng Lesson
        // nhưng không resolve được CourseContent.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForReviewSubmissionAsync_ShouldThrowKeyNotFoundException_WhenLessonBasedExamCannotResolveCourse()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Review Exam",
                    DurationMinutes = 30,
                    LessonId = lessonId
                });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(new project.Models.Lesson
                {
                    Id = lessonId,
                    Title = "Lesson A",
                    CourseContentId = courseContentId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync((project.Models.CourseContent?)null);

            var questionExamService = new QuestionExamService(
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object,
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                courseContentRepositoryMock.Object,
                lessonRepositoryMock.Object,
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            Func<Task> act = () => questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Associated course not found for this exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_24
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForReviewSubmissionAsync trả dữ liệu đúng cho nhánh Lesson + enrolled.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForReviewSubmissionAsync_ShouldReturnQuestions_WhenLessonBasedExamAndStudentEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var lessonId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Lesson Review Exam",
                    DurationMinutes = 30,
                    LessonId = lessonId
                });

            var lessonRepositoryMock = new Mock<ILessonRepository>();
            lessonRepositoryMock.Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(new project.Models.Lesson
                {
                    Id = lessonId,
                    Title = "Lesson A",
                    CourseContentId = courseContentId
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new project.Models.CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Content A"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(true);

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionsByExamIdAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExam { Id = questionId, ExamId = examId, Content = "Q1", Type = "SingleChoice", Exaplanation = "E1", Score = 1.0, IsRequired = true, Order = 1, IsNewest = true }
                ]);

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForReviewByQuestionExamIdAsync(questionId))
                .ReturnsAsync([new ChoiceForReviewDTO { Id = "c1", QuestionExamId = questionId, Content = "A", IsCorrect = true }]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                enrollmentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                lessonRepositoryMock.Object,
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = (await questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId)).ToList();

            // Assert
            result.Should().ContainSingle();
            result.Single().Id.Should().Be(questionId);
            result.Single().Choices.Should().ContainSingle(c => c.Id == "c1" && c.IsCorrect);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_25
        // [Mục đích]:
        // Đảm bảo ExistQuestionAsync trả về đúng kết quả từ repository.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task ExistQuestionAsync_ShouldReturnRepositoryResult()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.ExistQuestionAsync(questionId))
                .ReturnsAsync(true);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>(),
                Mock.Of<IChoiceService>(),
                Mock.Of<IChoiceRepository>(),
                Mock.Of<IEnrollmentCourseRepository>(),
                Mock.Of<ICourseContentRepository>(),
                Mock.Of<ILessonRepository>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IUnitOfWork>());

            // Act
            var result = await questionExamService.ExistQuestionAsync(questionId);

            // Assert
            result.Should().BeTrue();
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_QES_26
        // [Mục đích]:
        // Đảm bảo GetQuestionsByExamIdForDoingExamAsync trả dữ liệu khi exam thuộc CourseContent
        // và student đã enroll.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByExamIdForDoingExamAsync_ShouldReturnQuestions_WhenCourseBasedExamAndStudentEnrolled()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var courseContentId = Guid.NewGuid().ToString();
            var courseId = Guid.NewGuid().ToString();
            var questionId = Guid.NewGuid().ToString();

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Course Exam",
                    DurationMinutes = 30,
                    CourseContentId = courseContentId
                });

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetActiveAttemptAsync(studentId, examId, It.IsAny<DateTime>()))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = Guid.NewGuid().ToString(),
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(25),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });

            var courseContentRepositoryMock = new Mock<ICourseContentRepository>();
            courseContentRepositoryMock.Setup(r => r.GetCourseContentByIdAsync(courseContentId))
                .ReturnsAsync(new project.Models.CourseContent
                {
                    Id = courseContentId,
                    CourseId = courseId,
                    Title = "Content A"
                });

            var enrollmentRepositoryMock = new Mock<IEnrollmentCourseRepository>();
            enrollmentRepositoryMock.Setup(r => r.IsEnrollmentExistAsync(studentId, courseId))
                .ReturnsAsync(true);

            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.GetQuestionsByExamIdAsync(examId))
                .ReturnsAsync(
                [
                    new QuestionExam
                    {
                        Id = questionId,
                        ExamId = examId,
                        Content = "Q1",
                        Type = "SingleChoice",
                        Exaplanation = "E1",
                        Score = 1.0,
                        IsRequired = true,
                        Order = 1,
                        IsNewest = true
                    }
                ]);

            var choiceServiceMock = new Mock<IChoiceService>();
            choiceServiceMock.Setup(s => s.GetChoicesForExamByQuestionExamIdAsync(questionId))
                .ReturnsAsync([new ChoiceForExamDTO { Id = "c1", QuestionExamId = questionId, Content = "A" }]);

            var questionExamService = new QuestionExamService(
                questionRepositoryMock.Object,
                examRepositoryMock.Object,
                choiceServiceMock.Object,
                Mock.Of<IChoiceRepository>(),
                enrollmentRepositoryMock.Object,
                courseContentRepositoryMock.Object,
                Mock.Of<ILessonRepository>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IUnitOfWork>());

            // Act
            var result = (await questionExamService.GetQuestionsByExamIdForDoingExamAsync(studentId, examId)).ToList();

            // Assert
            result.Should().ContainSingle();
            result.Single().Id.Should().Be(questionId);
            result.Single().Choices.Should().ContainSingle(c => c.Id == "c1");
        }
    }
}

