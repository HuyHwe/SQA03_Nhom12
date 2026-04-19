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
using project.Modules.Posts.Repositories;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class DiscussionServiceTests
    {
        private readonly Mock<IDiscussionRepository> _mockDiscussionRepo;
        private readonly Mock<IStudentRepository> _mockStudentRepo;

        public DiscussionServiceTests()
        {
            _mockDiscussionRepo = new Mock<IDiscussionRepository>();
            _mockStudentRepo = new Mock<IStudentRepository>();
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

        private async Task<(string UserId, string StudentId, string TeacherUserId, string TeacherId, string CategoryId, string CourseId, string DiscussionId)> InsertDummyDiscussionAsync(DBContext dbContext)
        {
            var userId = "user_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0, 8);
            var teacherUserId = "tuser_" + Guid.NewGuid().ToString().Substring(0, 8);
            var teacherId = "tr_" + Guid.NewGuid().ToString().Substring(0, 8);
            var catId = "cat_" + Guid.NewGuid().ToString().Substring(0, 8);
            var courseId = "course_" + Guid.NewGuid().ToString().Substring(0, 8);
            var discId = Guid.NewGuid().ToString();

            // Create User & Student
            dbContext.Users.Add(new User { Id = userId, FullName = "Commenter", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });

            // Create Teacher
            dbContext.Users.Add(new User { Id = teacherUserId, FullName = "Teacher", UserName = teacherUserId, Email = teacherUserId + "@fake.com" });
            dbContext.Teachers.Add(new Teacher { TeacherId = teacherId, UserId = teacherUserId });

            // Create Category & Course
            dbContext.Categories.Add(new Category { Id = catId, Name = "Test Category" });
            dbContext.Courses.Add(new Course 
            { 
                Id = courseId, 
                Title = "Test Course", 
                CategoryId = catId, 
                TeacherId = teacherId,
                Price = 0, 
                Status = "published" 
            });

            // Create Discussion
            var discussion = new Discussion
            {
                Id = discId,
                StudentId = stuId,
                Content = "This is a comment",
                TargetType = "Course",
                TargetTypeId = courseId,
                CreatedAt = DateTime.Now
            };
            dbContext.Discussions.Add(discussion);
            await dbContext.SaveChangesAsync();

            return (userId, stuId, teacherUserId, teacherId, catId, courseId, discId);
        }

        private async Task CleanupDummyDiscussionAsync(DBContext dbContext, string userId, string stuId, string teacherUserId, string teacherId, string catId, string courseId, string discId)
        {
            var discussions = dbContext.Discussions.Where(d => d.Id == discId || d.ParentDiscussionId == discId).ToList();
            dbContext.Discussions.RemoveRange(discussions);

            // Handle CourseContent if any
            var contents = dbContext.CourseContents.Where(cc => cc.CourseId == courseId).ToList();
            dbContext.CourseContents.RemoveRange(contents);

            var courses = dbContext.Courses.Where(c => c.Id == courseId).ToList();
            dbContext.Courses.RemoveRange(courses);

            var categories = dbContext.Categories.Where(c => c.Id == catId).ToList();
            dbContext.Categories.RemoveRange(categories);

            var teachers = dbContext.Teachers.Where(t => t.TeacherId == teacherId).ToList();
            dbContext.Teachers.RemoveRange(teachers);

            var students = dbContext.Students.Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.Where(u => u.Id == userId || u.Id == teacherUserId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_01]
        // [Mục đích: CreateAsync ném lỗi nếu Content trống hoặc chỉ có khoảng trắng]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateAsync_ShouldThrowException_WhenContentIsEmpty()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);

            // Act
            Func<Task> act = async () => await service.CreateAsync("stu-1", "  ", "Course", "course-1");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Content không được để trống.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_02]
        // [Mục đích: CreateAsync ném lỗi nếu TargetType và TargetTypeId không hợp lệ (không tồn tại trong hệ thống)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateAsync_ShouldThrowException_WhenTargetIsInvalid()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            _mockDiscussionRepo.Setup(r => r.IsValidTargetAsync("InvalidType", "123")).ReturnsAsync(false);

            // Act
            Func<Task> act = async () => await service.CreateAsync("stu-1", "Hello", "InvalidType", "123");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("TargetType 'InvalidType' và TargetTypeId '123' không hợp lệ.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_03]
        // [Mục đích: UpdateAsync ném lỗi nếu sinh viên cố gắng sửa comment của người khác]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateAsync_ShouldThrowException_WhenNotOwner()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            var discussion = new Discussion { Id = "disc-1", StudentId = "original-author" };
            _mockDiscussionRepo.Setup(r => r.GetByIdAsync("disc-1")).ReturnsAsync(discussion);

            // Act
            Func<Task> act = async () => await service.UpdateAsync("hacker-id", "disc-1", new UpdateDiscussionRequest { Content = "Hacked" });

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Bạn không có quyền sửa Discussion này.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_04]
        // [Mục đích: DeleteAsync ném lỗi nếu sinh viên (không phải Admin) xóa comment của người khác]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteAsync_ShouldThrowException_WhenNotOwnerAndNotAdmin()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            var discussion = new Discussion { Id = "disc-1", StudentId = "author-id" };
            _mockDiscussionRepo.Setup(r => r.GetByIdAsync("disc-1")).ReturnsAsync(discussion);

            // Act
            Func<Task> act = async () => await service.DeleteAsync("stranger-id", "disc-1", isAdmin: false);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Bạn không có quyền xóa Discussion này.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_05]
        // [Mục đích: Happy Path - Luồng Tạo, Cập nhật và Xóa thảo luận thành công trên DB thật SQL Server]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task Discussion_FullFlow_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var discRepo = new DiscussionRepository(dbContext); // Giả định có DiscussionRepository
            var service = new DiscussionService(discRepo, _mockStudentRepo.Object);

            var data = await InsertDummyDiscussionAsync(dbContext);

            try
            {
                // 1. Create (với Parent Id)
                var createResult = await service.CreateAsync(data.StudentId, "Reply content", "Course", data.CourseId, data.DiscussionId);
                createResult.Should().NotBeNull();
                createResult.ParentDiscussionId.Should().Be(data.DiscussionId);

                // 2. Update
                var updateResult = await service.UpdateAsync(data.StudentId, createResult.Id, new UpdateDiscussionRequest { Content = "Updated content" });
                updateResult.Content.Should().Be("Updated content");

                // Check DB
                var saved = await dbContext.Discussions.FindAsync(createResult.Id);
                saved.Content.Should().Be("Updated content");

                // 3. Delete
                await service.DeleteAsync(data.StudentId, createResult.Id);
                var deleted = await dbContext.Discussions.FindAsync(createResult.Id);
                deleted.Should().BeNull();
            }
            finally
            {
                await CleanupDummyDiscussionAsync(dbContext, data.UserId, data.StudentId, data.TeacherUserId, data.TeacherId, data.CategoryId, data.CourseId, data.DiscussionId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_06]
        // [Mục đích: GetAllCommentsAsync trả về danh sách DTO được map đầy đủ thông tin sinh viên]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllCommentsAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            var discussions = new List<Discussion>
            {
                new Discussion 
                { 
                    Id = "d-1", 
                    Content = "Content 1", 
                    Student = new Student { User = new User { FullName = "User 1" } } 
                },
                new Discussion 
                { 
                    Id = "d-2", 
                    Content = "Content 2", 
                    Student = new Student { User = new User { FullName = "User 2" } } 
                }
            };
            _mockDiscussionRepo.Setup(r => r.GetAllCommentsAsync()).ReturnsAsync(discussions);

            // Act
            var result = await service.GetAllCommentsAsync();

            // Assert
            result.Should().HaveCount(2);
            result.First().StudentName.Should().Be("User 1");
            result.Last().StudentName.Should().Be("User 2");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_DIS_07]
        // [Mục đích: GetCommentsByTargetAsync trả về danh sách đã được lọc theo TargetType và Id]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetCommentsByTargetAsync_ShouldReturnFilteredMappedDtos()
        {
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            var discussions = new List<Discussion>
            {
                new Discussion 
                { 
                    Id = "d-1", 
                    TargetType = "Post", 
                    TargetTypeId = "p-1", 
                    Student = new Student { User = new User { FullName = "User 1" } } 
                }
            };
            _mockDiscussionRepo.Setup(r => r.GetCommentsByTargetAsync("Post", "p-1")).ReturnsAsync(discussions);

            // Act
            var result = await service.GetCommentsByTargetAsync("Post", "p-1");

            // Assert
            result.Should().HaveCount(1);
            result.First().Id.Should().Be("d-1");
            result.First().StudentName.Should().Be("User 1");
        }

      
        // SERV_DIS_08: Cập nhật content rỗng ném lỗi 
        [Fact]
        public async Task UpdateAsync_EmptyContent_ShouldFail()
        {
            // [FAIL_EXPECTED]: DiscussionService.UpdateAsync lacks validation for empty content (unlike CreateAsync).
            // Arrange
            var service = new DiscussionService(_mockDiscussionRepo.Object, _mockStudentRepo.Object);
            var discussion = new Discussion { Id = "d-1", StudentId = "author-1", Content = "Original" };
            _mockDiscussionRepo.Setup(r => r.GetByIdAsync("d-1")).ReturnsAsync(discussion);
            _mockDiscussionRepo.Setup(r => r.UpdateAsync(It.IsAny<Discussion>())).ReturnsAsync((Discussion d) => d);

            // Act
            // This SHOULD throw an exception if the code was good, but it won't.
            Func<Task> act = async () => await service.UpdateAsync("author-1", "d-1", new UpdateDiscussionRequest { Content = "  " });

            // Assert
            // This assertion will FAIL because the code doesn't throw.
            await act.Should().ThrowAsync<Exception>().WithMessage("Content không được để trống.");
        }
    }
}
