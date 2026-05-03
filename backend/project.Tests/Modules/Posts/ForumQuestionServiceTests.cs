using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using project.Models;
using project.Models.Posts;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class ForumQuestionServiceTests
    {
        private readonly Mock<IForumQuestionRepository> _mockRepo;

        public ForumQuestionServiceTests()
        {
            _mockRepo = new Mock<IForumQuestionRepository>();
        }

        private DBContext GetDatabaseContext()
        {
            var connectionString = "Server=localhost,1433;User Id=sa;Password=MatKhauBaoMat123!;Database=Elearning_project;TrustServerCertificate=True;";
            var options = new DbContextOptionsBuilder<DBContext>()
                .UseSqlServer(connectionString)
                .Options;
            return new DBContext(options);
        }

        // ================= HELPER METHODS =================

        private async Task<(string UserId, string StudentId, string QuestionId)> InsertDummyQuestionAsync(DBContext dbContext, bool isDeleted = false)
        {
            var userId = "user_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0, 8);
            var qId = Guid.NewGuid().ToString();

            dbContext.Users.Add(new User { Id = userId, FullName = "Asker", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });

            var question = new ForumQuestion
            {
                Id = qId,
                Title = "How to unit test?",
                ContentJson = "{}",
                Tags = "Testing",
                StudentId = stuId,
                IsDeleted = isDeleted,
                DeletedAt = isDeleted ? DateTime.Now : null,
                CreatedAt = DateTime.Now
            };
            dbContext.ForumQuestions.Add(question);
            await dbContext.SaveChangesAsync();

            return (userId, stuId, qId);
        }

        private async Task CleanupDummyQuestionAsync(DBContext dbContext, string userId, string stuId, string qId)
        {
            var questions = dbContext.ForumQuestions.IgnoreQueryFilters().Where(q => q.Id == qId).ToList();
            dbContext.ForumQuestions.RemoveRange(questions);

            var students = dbContext.Students.IgnoreQueryFilters().Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.IgnoreQueryFilters().Where(u => u.Id == userId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_01]
        // [Mục đích: GetQuestionByIdAsync ném lỗi nếu ID không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionByIdAsync_ShouldThrowException_WhenNotFound()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync("fake")).ReturnsAsync((ForumQuestion)null);

            // Act
            Func<Task> act = async () => await service.GetQuestionByIdAsync("fake");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Câu hỏi không tồn tại.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_02]
        // [Mục đích: UpdateAsync ném lỗi UnauthorizedAccessException nếu không phải chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateAsync_ShouldThrowUnauthorized_WhenNotOwner()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion { Id = "q-1", StudentId = "owner" };
            _mockRepo.Setup(r => r.GetByIdAsync("q-1")).ReturnsAsync(question);

            // Act
            Func<Task> act = async () => await service.UpdateAsync("q-1", "hacker", new ForumQuestionUpdateDto());

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>().WithMessage("Bạn không có quyền sửa câu hỏi này.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_03]
        // [Mục đích: Happy Path - Luồng Tạo -> Sửa -> Xóa mềm -> Khôi phục -> Xóa vĩnh viễn trên DB thật SQL Server]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ForumQuestion_FullFlow_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var qRepo = new project.Modules.Posts.Repositories.Interfaces.PostRepository(dbContext); // Need to check if there's a specialized Repo
            // Wait, I should use ForumQuestionRepository
            var forumRepo = new project.Modules.Posts.Repositories.Implements.ForumQuestionRepository(dbContext);
            var service = new ForumQuestionService(forumRepo);

            var userId = "u_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "s_" + Guid.NewGuid().ToString().Substring(0, 8);
            dbContext.Users.Add(new User { Id = userId, FullName = "User", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });
            await dbContext.SaveChangesAsync();

            string qId = null;

            try
            {
                // 1. Create
                qId = await service.CreateAsync(stuId, new ForumQuestionCreateDto { Title = "Initial", ContentJson = "{}", Tags = "T" });
                qId.Should().NotBeNull();

                // 2. Update
                var updateResult = await service.UpdateAsync(qId, stuId, new ForumQuestionUpdateDto { Title = "Updated", ContentJson = "{}", Tags = "T" });
                updateResult.Should().BeTrue();
                var updated = await dbContext.ForumQuestions.FindAsync(qId);
                updated.Title.Should().Be("Updated");

                // 3. Soft Delete
                await service.SoftDeleteAsync(qId, stuId);
                var softDeleted = await dbContext.ForumQuestions.FindAsync(qId);
                softDeleted.IsDeleted.Should().BeTrue();

                // 4. Restore
                await service.RestoreAsync(qId, stuId);
                var restored = await dbContext.ForumQuestions.FindAsync(qId);
                restored.IsDeleted.Should().BeFalse();

                // 5. Hard Delete
                await service.HardDeleteAsync(qId, stuId);
                var hardDeleted = await dbContext.ForumQuestions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == qId);
                hardDeleted.Should().BeNull();
            }
            finally
            {
                if (qId != null)
                {
                    var q = await dbContext.ForumQuestions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == qId);
                    if (q != null) dbContext.ForumQuestions.Remove(q);
                }
                var s = await dbContext.Students.FindAsync(stuId);
                if (s != null) dbContext.Students.Remove(s);
                var u = await dbContext.Users.FindAsync(userId);
                if (u != null) dbContext.Users.Remove(u);
                await dbContext.SaveChangesAsync();
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_04]
        // [Mục đích: IncreaseViewCountAsync cập nhật đúng số view trong DB thật]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task IncreaseViewCountAsync_ShouldIncrementViewCount()
        {
            var dbContext = GetDatabaseContext();
            var forumRepo = new project.Modules.Posts.Repositories.Implements.ForumQuestionRepository(dbContext);
            var service = new ForumQuestionService(forumRepo);

            var data = await InsertDummyQuestionAsync(dbContext);

            try
            {
                await service.IncreaseViewCountAsync(data.QuestionId);
                
                var saved = await dbContext.ForumQuestions.AsNoTracking().FirstOrDefaultAsync(q => q.Id == data.QuestionId);
                saved.ViewCount.Should().Be(1);
            }
            finally
            {
                await CleanupDummyQuestionAsync(dbContext, data.UserId, data.StudentId, data.QuestionId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_05]
        // [Mục đích: GetQuestionByIdAsync trả về đầy đủ thông tin chi tiết khi câu hỏi tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionByIdAsync_ShouldReturnDetailDto_WhenFound()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion 
            { 
                Id = "q-1", 
                Title = "Title", 
                Student = new Student { User = new User { FullName = "Owner" } } 
            };
            _mockRepo.Setup(r => r.GetByIdAsync("q-1")).ReturnsAsync(question);

            // Act
            var result = await service.GetQuestionByIdAsync("q-1");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("q-1");
            result.StudentName.Should().Be("Owner");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_06]
        // [Mục đích: GetAllQuestionsAsync trả về danh sách được map đúng DTO]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllQuestionsAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            var questions = new List<ForumQuestion>
            {
                new ForumQuestion { Id = "q-1", Student = new Student { User = new User { FullName = "User 1" } } },
                new ForumQuestion { Id = "q-2", Student = new Student { User = new User { FullName = "User 2" } } }
            };
            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(questions);

            // Act
            var result = await service.GetAllQuestionsAsync();

            // Assert
            result.Should().HaveCount(2);
            result.First().StudentName.Should().Be("User 1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_07]
        // [Mục đích: GetAllQuestionsPagedAsync hỗ trợ phân trang và trả về đúng tổng số bản ghi]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllQuestionsPagedAsync_ShouldReturnPagedMappedDtos()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            var questions = new List<ForumQuestion>
            {
                new ForumQuestion { Id = "q-1", Student = new Student { User = new User { FullName = "User 1" } } }
            };
            _mockRepo.Setup(r => r.GetPagingAsync(1, 10, null)).ReturnsAsync((questions, 100));

            // Act
            var (items, total) = await service.GetAllQuestionsPagedAsync(1, 10);

            // Assert
            items.Should().HaveCount(1);
            total.Should().Be(100);
            items.First().StudentName.Should().Be("User 1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_08]
        // [Mục đích: GetQuestionsByStudentAsync trả về các câu hỏi đã được lọc theo StudentId]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetQuestionsByStudentAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var service = new ForumQuestionService(_mockRepo.Object);
            var questions = new List<ForumQuestion>
            {
                new ForumQuestion { Id = "q-1", StudentId = "stu-1", Student = new Student { User = new User { FullName = "Owner" } } }
            };
            _mockRepo.Setup(r => r.GetByStudentPublicAsync("stu-1")).ReturnsAsync(questions);

            // Act
            var result = await service.GetQuestionsByStudentAsync("stu-1");

            // Assert
            result.Should().HaveCount(1);
            result.First().StudentId.Should().Be("stu-1");
            result.First().StudentName.Should().Be("Owner");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_09]
        // [Mục đích: SoftDeleteAsync cập nhật IsDeleted thành True khi người dùng là chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task SoftDeleteAsync_ShouldSetIsDeletedToTrue_MockRepo()
        {
            // Arrange
            var question = new ForumQuestion { Id = "q-1", StudentId = "stu-1", IsDeleted = false };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            var service = new ForumQuestionService(_mockRepo.Object);

            // Act
            var result = await service.SoftDeleteAsync("q-1", "stu-1");

            // Assert
            result.Should().BeTrue();
            question.IsDeleted.Should().BeTrue();
            _mockRepo.Verify(r => r.UpdateAsync(It.Is<ForumQuestion>(q => q.IsDeleted == true)), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_10]
        // [Mục đích: RestoreAsync cập nhật IsDeleted thành False khi người dùng là chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestoreAsync_ShouldSetIsDeletedToFalse_MockRepo()
        {
            // Arrange
            var question = new ForumQuestion { Id = "q-1", StudentId = "stu-1", IsDeleted = true };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            var service = new ForumQuestionService(_mockRepo.Object);

            // Act
            var result = await service.RestoreAsync("q-1", "stu-1");

            // Assert
            result.Should().BeTrue();
            question.IsDeleted.Should().BeFalse();
            _mockRepo.Verify(r => r.UpdateAsync(It.Is<ForumQuestion>(q => q.IsDeleted == false)), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_11]
        // [Mục đích: UpdateAsync trả về false nếu câu hỏi không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateAsync_ShouldReturnFalse_WhenQuestionNotFound()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync("fake")).ReturnsAsync((ForumQuestion)null);
            var result = await service.UpdateAsync("fake", "stu-1", new ForumQuestionUpdateDto());
            result.Should().BeFalse();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_12]
        // [Mục đích: SoftDeleteAsync trả về false nếu câu hỏi không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task SoftDeleteAsync_ShouldReturnFalse_WhenQuestionNotFound()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("fake")).ReturnsAsync((ForumQuestion)null);
            var result = await service.SoftDeleteAsync("fake", "stu-1");
            result.Should().BeFalse();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_13]
        // [Mục đích: SoftDeleteAsync ném lỗi UnauthorizedAccessException nếu không phải chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task SoftDeleteAsync_ShouldThrowUnauthorized_WhenNotOwner()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion { Id = "q-1", StudentId = "owner" };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            Func<Task> act = async () => await service.SoftDeleteAsync("q-1", "hacker");
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_14]
        // [Mục đích: RestoreAsync trả về false nếu câu hỏi không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestoreAsync_ShouldReturnFalse_WhenQuestionNotFound()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("fake")).ReturnsAsync((ForumQuestion)null);
            var result = await service.RestoreAsync("fake", "stu-1");
            result.Should().BeFalse();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_15]
        // [Mục đích: RestoreAsync ném lỗi UnauthorizedAccessException nếu không phải chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestoreAsync_ShouldThrowUnauthorized_WhenNotOwner()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion { Id = "q-1", StudentId = "owner" };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            Func<Task> act = async () => await service.RestoreAsync("q-1", "hacker");
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_16]
        // [Mục đích: HardDeleteAsync trả về false nếu câu hỏi không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HardDeleteAsync_ShouldReturnFalse_WhenQuestionNotFound()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("fake")).ReturnsAsync((ForumQuestion)null);
            var result = await service.HardDeleteAsync("fake", "stu-1");
            result.Should().BeFalse();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_17]
        // [Mục đích: HardDeleteAsync ném lỗi UnauthorizedAccessException nếu không phải chủ sở hữu và không phải admin]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HardDeleteAsync_ShouldThrowUnauthorized_WhenNotOwnerAndNotAdmin()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion { Id = "q-1", StudentId = "owner" };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            Func<Task> act = async () => await service.HardDeleteAsync("q-1", "hacker");
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_18]
        // [Mục đích: HardDeleteAsync thành công nếu là Admin nhưng không phải chủ sở hữu]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HardDeleteAsync_ShouldSucceed_WhenIsAdmin()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            var question = new ForumQuestion { Id = "q-1", StudentId = "owner" };
            _mockRepo.Setup(r => r.GetByIdAllowDeletedAsync("q-1")).ReturnsAsync(question);
            var result = await service.HardDeleteAsync("q-1", "admin", isAdmin: true);
            result.Should().BeTrue();
            _mockRepo.Verify(r => r.Delete(question), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_19]
        // [Mục đích: IncreaseViewCountAsync trả về false nếu câu hỏi không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task IncreaseViewCountAsync_ShouldReturnFalse_WhenQuestionNotFound()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync("fake")).ReturnsAsync((ForumQuestion)null);
            var result = await service.IncreaseViewCountAsync("fake");
            result.Should().BeFalse();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_FQS_20]
        // [Mục đích: GetDeletedQuestionsAsync trả về danh sách được map đúng DTO bao gồm fallback title và null student user]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetDeletedQuestionsAsync_ShouldReturnMappedDtos_WithNullChecks()
        {
            var service = new ForumQuestionService(_mockRepo.Object);
            var questions = new List<ForumQuestion>
            {
                new ForumQuestion { Id = "q-1", Title = null, Student = new Student { User = null } }
            };
            _mockRepo.Setup(r => r.GetDeletedByStudentAsync("stu-1")).ReturnsAsync(questions);

            var result = await service.GetDeletedQuestionsAsync("stu-1");

            result.Should().HaveCount(1);
            result.First().Title.Should().Be(string.Empty);
            result.First().StudentName.Should().Be("Ẩn danh");
        }
    }
}
