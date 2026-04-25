using FluentAssertions;
using Moq;

namespace project.Tests.Modules.Exams
{
    public class SubmissionExamServiceTests
    {
        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_01
        // [Mục đích]:
        // Đảm bảo CreateSubmissionExamAsync ném lỗi khi attempt đã submitted trước đó.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateSubmissionExamAsync_ShouldThrowInvalidOperationException_WhenAttemptAlreadySubmitted()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-20),
                    EndTime = DateTime.UtcNow.AddMinutes(20),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-20),
                    IsSubmitted = true
                });

            var submissionExamService = new SubmissionExamService(
                Mock.Of<ISubmissionExamRepository>(),
                Mock.Of<ISubmissionAnswerRepository>(),
                Mock.Of<IExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IQuestionExamService>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>());

            // Act
            Func<Task> act = () => submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("This exam attempt has already been submitted*");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_02
        // [Mục đích]:
        // Đảm bảo CreateSubmissionExamAsync ném lỗi khi attempt hết hạn.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateSubmissionExamAsync_ShouldThrowInvalidOperationException_WhenAttemptExpired()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-40),
                    EndTime = DateTime.UtcNow.AddMinutes(-5),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-40),
                    IsSubmitted = false
                });

            var submissionExamService = new SubmissionExamService(
                Mock.Of<ISubmissionExamRepository>(),
                Mock.Of<ISubmissionAnswerRepository>(),
                Mock.Of<IExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IQuestionExamService>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>());

            // Act
            Func<Task> act = () => submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("This exam attempt has expired and can no longer be submitted.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_03
        // [Mục đích]:
        // Đảm bảo CreateSubmissionExamAsync ném UnauthorizedAccessException nếu attempt không thuộc student.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateSubmissionExamAsync_ShouldThrowUnauthorizedAccessException_WhenAttemptDoesNotBelongToStudent()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var otherStudentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = otherStudentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(25),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });
            examAttemptRepositoryMock.Setup(r => r.SaveExamAttempAsync(It.IsAny<ExamAttemp>()))
                .ReturnsAsync(true);

            var submissionExamService = new SubmissionExamService(
                Mock.Of<ISubmissionExamRepository>(),
                Mock.Of<ISubmissionAnswerRepository>(),
                Mock.Of<IExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IQuestionExamService>(),
                examAttemptRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>());

            // Act
            Func<Task> act = () => submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, "[]");

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not authorized to access this exam attempt.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_04
        // [Mục đích]:
        // Đảm bảo CreateSubmissionExamAsync ném lỗi khi payload có questionId không thuộc exam.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateSubmissionExamAsync_ShouldThrowInvalidOperationException_WhenPayloadContainsInvalidQuestionId()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var validQuestionId = Guid.NewGuid().ToString();
            var invalidQuestionId = Guid.NewGuid().ToString();

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = examId,
                    StartTime = DateTime.UtcNow.AddMinutes(-5),
                    EndTime = DateTime.UtcNow.AddMinutes(30),
                    AttemptedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSubmitted = false
                });
            examAttemptRepositoryMock.Setup(r => r.SaveExamAttempAsync(It.IsAny<ExamAttemp>()))
                .ReturnsAsync(true);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, true));

            var studentRepositoryMock = new Mock<IStudentRepository>();
            studentRepositoryMock.Setup(r => r.IsStudentExistAsync(studentId))
                .ReturnsAsync(true);

            var questionServiceMock = new Mock<IQuestionExamService>();
            questionServiceMock.Setup(s => s.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId))
                .ReturnsAsync(
                [
                    new QuestionExamForReviewSubmissionDTO
                    {
                        Id = validQuestionId,
                        ExamId = examId,
                        Content = "Q1",
                        Type = "SingleChoice",
                        Explanation = "E1",
                        Score = 1,
                        Choices = [new ChoiceForReviewDTO { Id = "c1", Content = "A", QuestionExamId = validQuestionId, IsCorrect = true }]
                    }
                ]);

            var submissionExamRepositoryMock = new Mock<ISubmissionExamRepository>();

            var submissionExamService = new SubmissionExamService(
                submissionExamRepositoryMock.Object,
                Mock.Of<ISubmissionAnswerRepository>(),
                examRepositoryMock.Object,
                studentRepositoryMock.Object,
                questionServiceMock.Object,
                examAttemptRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>());

            var payloadWithInvalidQuestion = $"[{{\"questionId\":\"{invalidQuestionId}\",\"choices\":[{{\"id\":\"c1\"}}]}}]";

            // Act
            Func<Task> act = () => submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, payloadWithInvalidQuestion);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Invalid question IDs found*");
            submissionExamRepositoryMock.Verify(r => r.CreateSubmissionExamAsync(It.IsAny<SubmissionExam>()), Times.Never);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_05
        // [Mục đích]:
        // Kiểm tra happy path chấm bài:
        // - [CheckDB] Lưu SubmissionExam + SubmissionAnswer + cập nhật attempt đúng dữ liệu.
        // - [Rollback] Dọn DB về trạng thái trước test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateSubmissionExamAsync_ShouldPersistSubmissionAndScore_WhenPayloadIsValid()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(CreateSubmissionExamAsync_ShouldPersistSubmissionAndScore_WhenPayloadIsValid));
            var submissionExamRepository = new SubmissionExamRepository(dbContext);
            var submissionAnswerRepository = new SubmissionAnswerRepository(dbContext);
            var examAttemptRepository = new ExamAttempRepository(dbContext);

            var studentId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();

            dbContext.ExamAttemps.Add(new ExamAttemp
            {
                Id = attemptId,
                StudentId = studentId,
                ExamId = examId,
                StartTime = DateTime.UtcNow.AddMinutes(-10),
                EndTime = DateTime.UtcNow.AddMinutes(30),
                AttemptedAt = DateTime.UtcNow.AddMinutes(-10),
                IsSubmitted = false,
                SavedAnswers = null
            });
            await dbContext.SaveChangesAsync();

            var question1Id = Guid.NewGuid().ToString();
            var question2Id = Guid.NewGuid().ToString();
            var correctChoiceQ1 = Guid.NewGuid().ToString();
            var wrongChoiceQ2 = Guid.NewGuid().ToString();
            var correctChoiceQ2 = Guid.NewGuid().ToString();

            var questionServiceMock = new Mock<IQuestionExamService>();
            questionServiceMock.Setup(s => s.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId))
                .ReturnsAsync(
                [
                    new QuestionExamForReviewSubmissionDTO
                    {
                        Id = question1Id,
                        ExamId = examId,
                        Content = "Question 1",
                        Type = "SingleChoice",
                        Explanation = "E1",
                        Score = 2.0,
                        Choices =
                        [
                            new ChoiceForReviewDTO { Id = correctChoiceQ1, QuestionExamId = question1Id, Content = "A", IsCorrect = true }
                        ]
                    },
                    new QuestionExamForReviewSubmissionDTO
                    {
                        Id = question2Id,
                        ExamId = examId,
                        Content = "Question 2",
                        Type = "SingleChoice",
                        Explanation = "E2",
                        Score = 3.0,
                        Choices =
                        [
                            new ChoiceForReviewDTO { Id = correctChoiceQ2, QuestionExamId = question2Id, Content = "B", IsCorrect = true },
                            new ChoiceForReviewDTO { Id = wrongChoiceQ2, QuestionExamId = question2Id, Content = "C", IsCorrect = false }
                        ]
                    }
                ]);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamStatusAsync(examId))
                .ReturnsAsync((true, true));

            var studentRepositoryMock = new Mock<IStudentRepository>();
            studentRepositoryMock.Setup(r => r.IsStudentExistAsync(studentId))
                .ReturnsAsync(true);

            var submissionExamService = new SubmissionExamService(
                submissionExamRepository,
                submissionAnswerRepository,
                examRepositoryMock.Object,
                studentRepositoryMock.Object,
                questionServiceMock.Object,
                examAttemptRepository,
                Mock.Of<IQuestionExamRepository>());

            var submitPayload = $"[" +
                                $"{{\"questionId\":\"{question1Id}\",\"choices\":[{{\"id\":\"{correctChoiceQ1}\"}}]}}," +
                                $"{{\"questionId\":\"{question2Id}\",\"choices\":[{{\"id\":\"{wrongChoiceQ2}\"}}]}}" +
                                $"]";

            try
            {
                // Act
                await submissionExamService.CreateSubmissionExamAsync(studentId, attemptId, submitPayload);

                // Assert - [CheckDB]
                var savedSubmission = dbContext.SubmissionExams.Single(se => se.ExamAttemptId == attemptId);
                savedSubmission.TotalCorrect.Should().Be(1);
                savedSubmission.Score.Should().Be(2.0);

                var savedAnswers = dbContext.SubmissionAnswers.Where(sa => sa.SubmissionExamId == savedSubmission.Id).ToList();
                savedAnswers.Should().HaveCount(2);
                savedAnswers.Count(a => a.IsCorrect).Should().Be(1);

                var updatedAttempt = dbContext.ExamAttemps.Single(a => a.Id == attemptId);
                updatedAttempt.IsSubmitted.Should().BeTrue();
                updatedAttempt.SavedAnswers.Should().Be(submitPayload);
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_06
        // [Mục đích]:
        // Đảm bảo GetSubmissionExamDetailDTOAsync trả về đúng tổng hợp dữ liệu khi input hợp lệ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetSubmissionExamDetailDTOAsync_ShouldReturnSummary_WhenInputIsValid()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var attemptId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();
            var submissionId = Guid.NewGuid().ToString();

            var attemptedAt = DateTime.UtcNow.AddMinutes(-20);
            var submittedAt = DateTime.UtcNow.AddMinutes(-5);

            var examAttemptRepositoryMock = new Mock<IExamAttempRepository>();
            examAttemptRepositoryMock.Setup(r => r.GetExamAttempByIdAsync(attemptId))
                .ReturnsAsync(new ExamAttemp
                {
                    Id = attemptId,
                    StudentId = studentId,
                    ExamId = examId,
                    AttemptedAt = attemptedAt,
                    SubmittedAt = submittedAt,
                    StartTime = DateTime.UtcNow.AddMinutes(-20),
                    EndTime = DateTime.UtcNow.AddMinutes(40),
                    IsSubmitted = true
                });

            var questionExamRepositoryMock = new Mock<IQuestionExamRepository>();
            questionExamRepositoryMock.Setup(r => r.CountQuestionsInExamAsync(examId))
                .ReturnsAsync(10);

            var submissionExamRepositoryMock = new Mock<ISubmissionExamRepository>();
            submissionExamRepositoryMock.Setup(r => r.GetSubmissionExamByExamAttemptIdAsync(attemptId))
                .ReturnsAsync(new SubmissionExam
                {
                    Id = submissionId,
                    ExamId = examId,
                    ExamAttemptId = attemptId,
                    StudentId = studentId,
                    TotalCorrect = 7,
                    Score = 7.0
                });

            var submissionExamService = new SubmissionExamService(
                submissionExamRepositoryMock.Object,
                Mock.Of<ISubmissionAnswerRepository>(),
                Mock.Of<IExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IQuestionExamService>(),
                examAttemptRepositoryMock.Object,
                questionExamRepositoryMock.Object);

            // Act
            var result = await submissionExamService.GetSubmissionExamDetailDTOAsync(studentId, attemptId);

            // Assert
            result.SubmissionExamId.Should().Be(submissionId);
            result.ExamId.Should().Be(examId);
            result.TotalCount.Should().Be(10);
            result.TotalCorrect.Should().Be(7);
            result.Score.Should().Be(7.0);
            result.AttemptedAt.Should().Be(attemptedAt);
            result.SubmittedAt.Should().Be(submittedAt);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_SES_07
        // [Mục đích]:
        // Đảm bảo GetUserSubmissionResultAsync ném UnauthorizedAccessException khi student
        // cố đọc submission của user khác.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetUserSubmissionResultAsync_ShouldThrowUnauthorizedAccessException_WhenSubmissionBelongsToAnotherStudent()
        {
            // Arrange
            var studentId = Guid.NewGuid().ToString();
            var otherStudentId = Guid.NewGuid().ToString();
            var submissionExamId = Guid.NewGuid().ToString();

            var submissionExamRepositoryMock = new Mock<ISubmissionExamRepository>();
            submissionExamRepositoryMock.Setup(r => r.GetSubmissionExamByIdAsync(submissionExamId))
                .ReturnsAsync(new SubmissionExam
                {
                    Id = submissionExamId,
                    StudentId = otherStudentId,
                    ExamAttemptId = Guid.NewGuid().ToString(),
                    ExamId = Guid.NewGuid().ToString()
                });

            var submissionExamService = new SubmissionExamService(
                submissionExamRepositoryMock.Object,
                Mock.Of<ISubmissionAnswerRepository>(),
                Mock.Of<IExamRepository>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IQuestionExamService>(),
                Mock.Of<IExamAttempRepository>(),
                Mock.Of<IQuestionExamRepository>());

            // Act
            Func<Task> act = () => submissionExamService.GetUserSubmissionResultAsync(studentId, submissionExamId);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("You are not authorized to access this submission exam.");
        }
    }
}

