using FluentAssertions;
using Moq;

namespace project.Tests.Modules.Exams
{
    public class ChoiceServiceTests
    {
        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_01
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o AddChoiceAsync nÃ©m lá»—i khi questionExamId khÃ´ng tá»“n táº¡i.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddChoiceAsync_ShouldThrowArgumentException_WhenQuestionDoesNotExist()
        {
            // Arrange
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.ExistQuestionAsync(It.IsAny<string>()))
                .ReturnsAsync(false);

            var choiceService = new ChoiceService(
                Mock.Of<IChoiceRepository>(),
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>());

            var addChoiceDto = new AddChoiceDTO
            {
                Content = "Answer A",
                IsCorrect = true
            };

            // Act
            Func<Task> act = () => choiceService.AddChoiceAsync(Guid.NewGuid().ToString(), Guid.NewGuid().ToString(), addChoiceDto);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("QuestionExam with ID*does not exist.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_02
        // [Má»¥c Ä‘Ã­ch]:
        // Kiá»ƒm tra nhÃ¡nh happy path AddChoiceAsync:
        // - [CheckDB] Choice Ä‘Æ°á»£c lÆ°u Ä‘Ãºng dá»¯ liá»‡u.
        // - [Rollback] Dá»n DB vá» tráº¡ng thÃ¡i trÆ°á»›c test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddChoiceAsync_ShouldInsertChoiceIntoDatabase_WhenQuestionExists()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(AddChoiceAsync_ShouldInsertChoiceIntoDatabase_WhenQuestionExists));
            var choiceRepository = new ChoiceRepository(dbContext);

            var questionExamId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.ExistQuestionAsync(questionExamId))
                .ReturnsAsync(true);

            var choiceService = new ChoiceService(
                choiceRepository,
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>());

            var addChoiceDto = new AddChoiceDTO
            {
                Content = "Answer B",
                IsCorrect = false
            };

            try
            {
                // Act
                await choiceService.AddChoiceAsync(Guid.NewGuid().ToString(), questionExamId, addChoiceDto);

                // Assert - [CheckDB]
                var savedChoice = dbContext.Choices.Single(c => c.QuestionExamId == questionExamId);
                savedChoice.Content.Should().Be("Answer B");
                savedChoice.IsCorrect.Should().BeFalse();
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_03
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o UpdateChoiceAsync nÃ©m lá»—i khi exam Ä‘ang opened.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateChoiceAsync_ShouldThrowInvalidOperationException_WhenExamIsOpened()
        {
            // Arrange
            var choiceId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoiceByIdAsync(choiceId))
                .ReturnsAsync(new Choice
                {
                    Id = choiceId,
                    QuestionExamId = Guid.NewGuid().ToString(),
                    Content = "Old Content",
                    IsCorrect = false,
                    QuestionExam = new QuestionExam
                    {
                        Id = Guid.NewGuid().ToString(),
                        ExamId = examId,
                        Content = "Question",
                        Type = "SingleChoice",
                        Exaplanation = "Explanation"
                    }
                });

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Opened Exam",
                    DurationMinutes = 30,
                    IsOpened = true
                });

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object);

            var updateChoiceDto = new ChoiceUpdateDTO { Content = "New Content" };

            // Act
            Func<Task> act = () => choiceService.UpdateChoiceAsync(Guid.NewGuid().ToString(), choiceId, updateChoiceDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Cannot update to an opened exam.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_04
        // [Má»¥c Ä‘Ã­ch]:
        // Kiá»ƒm tra DeleteChoiceByIdAsync xÃ³a báº£n ghi choice Ä‘Ãºng DB:
        // - [CheckDB] Choice pháº£i biáº¿n máº¥t sau khi gá»i service.
        // - [Rollback] Dá»n DB vá» tráº¡ng thÃ¡i trÆ°á»›c test.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteChoiceByIdAsync_ShouldDeleteChoiceFromDatabase_WhenChoiceExists()
        {
            // Arrange
            using var dbContext = ExamsTestDbFactory.CreateInMemoryDbContext(nameof(DeleteChoiceByIdAsync_ShouldDeleteChoiceFromDatabase_WhenChoiceExists));
            var choiceRepository = new ChoiceRepository(dbContext);
            var choiceService = new ChoiceService(
                choiceRepository,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IExamRepository>());

            var choiceId = Guid.NewGuid().ToString();
            dbContext.Choices.Add(new Choice
            {
                Id = choiceId,
                QuestionExamId = Guid.NewGuid().ToString(),
                Content = "Choice To Delete",
                IsCorrect = false
            });
            await dbContext.SaveChangesAsync();

            try
            {
                // Act
                await choiceService.DeleteChoiceByIdAsync(Guid.NewGuid().ToString(), choiceId);

                // Assert - [CheckDB]
                dbContext.Choices.Any(c => c.Id == choiceId).Should().BeFalse();
            }
            finally
            {
                // [Rollback]
                await ExamsTestDbFactory.RollbackAsync(dbContext);
            }
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_05
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o GetChoicesForReviewByQuestionExamIdAsync map IsCorrect Ä‘Ãºng:
        // - null tá»« DB pháº£i Ä‘Æ°á»£c chuáº©n hÃ³a thÃ nh false á»Ÿ DTO.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetChoicesForReviewByQuestionExamIdAsync_ShouldMapNullIsCorrectToFalse()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoicesByQuestionExamIdAsync(questionId))
                .ReturnsAsync(
                [
                    new Choice { Id = "c1", QuestionExamId = questionId, Content = "A", IsCorrect = null },
                    new Choice { Id = "c2", QuestionExamId = questionId, Content = "B", IsCorrect = true }
                ]);

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            var result = (await choiceService.GetChoicesForReviewByQuestionExamIdAsync(questionId)).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Single(x => x.Id == "c1").IsCorrect.Should().BeFalse();
            result.Single(x => x.Id == "c2").IsCorrect.Should().BeTrue();
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_06
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o AddChoiceAsync wrap exception thÃ nh ApplicationException khi repository lá»—i.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task AddChoiceAsync_ShouldThrowApplicationException_WhenRepositoryThrowsException()
        {
            // Arrange
            var questionExamId = Guid.NewGuid().ToString();
            var questionRepositoryMock = new Mock<IQuestionExamRepository>();
            questionRepositoryMock.Setup(r => r.ExistQuestionAsync(questionExamId)).ReturnsAsync(true);

            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.AddChoiceAsync(It.IsAny<Choice>()))
                .ThrowsAsync(new Exception("DB error"));

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                questionRepositoryMock.Object,
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => choiceService.AddChoiceAsync(Guid.NewGuid().ToString(), questionExamId, new AddChoiceDTO
            {
                Content = "Answer",
                IsCorrect = true
            });

            // Assert
            await act.Should().ThrowAsync<ApplicationException>()
                .WithMessage("An error occurred while adding the choice.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_07
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o GetChoicesForExamByQuestionExamIdAsync map dá»¯ liá»‡u Ä‘Ãºng cho doing-exam flow.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetChoicesForExamByQuestionExamIdAsync_ShouldMapChoiceDtos_WhenRepositoryReturnsChoices()
        {
            // Arrange
            var questionId = Guid.NewGuid().ToString();
            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoicesByQuestionExamIdAsync(questionId))
                .ReturnsAsync(
                [
                    new Choice { Id = "c1", QuestionExamId = questionId, Content = "A", IsCorrect = true },
                    new Choice { Id = "c2", QuestionExamId = questionId, Content = "B", IsCorrect = false }
                ]);

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            var result = (await choiceService.GetChoicesForExamByQuestionExamIdAsync(questionId)).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.QuestionExamId == questionId);
            result.Select(x => x.Id).Should().Contain(["c1", "c2"]);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_08
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o UpdateChoiceAsync nÃ©m KeyNotFoundException khi choice khÃ´ng tá»“n táº¡i.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateChoiceAsync_ShouldThrowKeyNotFoundException_WhenChoiceDoesNotExist()
        {
            // Arrange
            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoiceByIdAsync(It.IsAny<string>()))
                .ReturnsAsync((Choice?)null);

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                Mock.Of<IExamRepository>());

            // Act
            Func<Task> act = () => choiceService.UpdateChoiceAsync(Guid.NewGuid().ToString(), Guid.NewGuid().ToString(), new ChoiceUpdateDTO { Content = "New" });

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Choice not found");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_09
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o UpdateChoiceAsync nÃ©m KeyNotFoundException khi exam cá»§a choice khÃ´ng tá»“n táº¡i.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateChoiceAsync_ShouldThrowKeyNotFoundException_WhenExamDoesNotExist()
        {
            // Arrange
            var choiceId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoiceByIdAsync(choiceId))
                .ReturnsAsync(new Choice
                {
                    Id = choiceId,
                    Content = "Old",
                    QuestionExamId = Guid.NewGuid().ToString(),
                    QuestionExam = new QuestionExam
                    {
                        Id = Guid.NewGuid().ToString(),
                        ExamId = examId,
                        Content = "Q",
                        Type = "SingleChoice",
                        Exaplanation = "E"
                    }
                });

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync((Exam?)null);

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object);

            // Act
            Func<Task> act = () => choiceService.UpdateChoiceAsync(Guid.NewGuid().ToString(), choiceId, new ChoiceUpdateDTO { Content = "New" });

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage($"Exam with id {examId} not found.");
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_10
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o UpdateChoiceAsync cáº­p nháº­t content thÃ nh cÃ´ng khi exam chÆ°a má»Ÿ.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateChoiceAsync_ShouldUpdateChoice_WhenExamIsClosed()
        {
            // Arrange
            var choiceId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var choice = new Choice
            {
                Id = choiceId,
                Content = "Old Content",
                QuestionExamId = Guid.NewGuid().ToString(),
                QuestionExam = new QuestionExam
                {
                    Id = Guid.NewGuid().ToString(),
                    ExamId = examId,
                    Content = "Q",
                    Type = "SingleChoice",
                    Exaplanation = "E"
                }
            };

            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoiceByIdAsync(choiceId))
                .ReturnsAsync(choice);

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Closed",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object);

            // Act
            await choiceService.UpdateChoiceAsync(Guid.NewGuid().ToString(), choiceId, new ChoiceUpdateDTO { Content = "New Content" });

            // Assert
            choiceRepositoryMock.Verify(r => r.UpdateChoiceAsync(It.Is<Choice>(c => c.Id == choiceId && c.Content == "New Content")), Times.Once);
        }

        // --------------------------------------------------------------------------------------------
        // [Test Case ID]: SERV_CS_11
        // [Má»¥c Ä‘Ã­ch]:
        // Äáº£m báº£o UpdateChoiceAsync wrap exception khi repository update lá»—i.
        // --------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateChoiceAsync_ShouldThrowException_WhenRepositoryUpdateFails()
        {
            // Arrange
            var choiceId = Guid.NewGuid().ToString();
            var examId = Guid.NewGuid().ToString();

            var choiceRepositoryMock = new Mock<IChoiceRepository>();
            choiceRepositoryMock.Setup(r => r.GetChoiceByIdAsync(choiceId))
                .ReturnsAsync(new Choice
                {
                    Id = choiceId,
                    Content = "Old",
                    QuestionExamId = Guid.NewGuid().ToString(),
                    QuestionExam = new QuestionExam
                    {
                        Id = Guid.NewGuid().ToString(),
                        ExamId = examId,
                        Content = "Q",
                        Type = "SingleChoice",
                        Exaplanation = "E"
                    }
                });
            choiceRepositoryMock.Setup(r => r.UpdateChoiceAsync(It.IsAny<Choice>()))
                .ThrowsAsync(new Exception("Update failed"));

            var examRepositoryMock = new Mock<IExamRepository>();
            examRepositoryMock.Setup(r => r.GetExamByIdAsync(examId))
                .ReturnsAsync(new Exam
                {
                    Id = examId,
                    Title = "Closed",
                    DurationMinutes = 30,
                    IsOpened = false
                });

            var choiceService = new ChoiceService(
                choiceRepositoryMock.Object,
                Mock.Of<IQuestionExamRepository>(),
                examRepositoryMock.Object);

            // Act
            Func<Task> act = () => choiceService.UpdateChoiceAsync(Guid.NewGuid().ToString(), choiceId, new ChoiceUpdateDTO { Content = "New" });

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("An error occurred while update choice.");
        }
    }
}

