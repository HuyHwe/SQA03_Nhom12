using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using project.Models;
using project.Models.Posts;
using project.Modules.Posts.Repositories.Implements;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using project.Modules.Posts.DTOs;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class LikesServiceTests
    {
        private readonly Mock<ILikesRepository> _mockRepo;

        public LikesServiceTests()
        {
            _mockRepo = new Mock<ILikesRepository>();
        }

        private DBContext GetDatabaseContext()
        {
            var connectionString = "Server=localhost,1433;User Id=sa;Password=MatKhauBaoMat123!;Database=Elearning_project;TrustServerCertificate=True;";
            var options = new DbContextOptionsBuilder<DBContext>()
                .UseSqlServer(connectionString)
                .Options;
            return new DBContext(options);
        }

        private DBContext GetInMemoryDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<DBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new DBContext(options);
        }

        // ================= HELPER METHODS =================

        private async Task<(string UserId, string StudentId, string PostId, string CatId)> InsertDummyPostForLikeAsync(DBContext dbContext)
        {
            var userId = "u_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "s_" + Guid.NewGuid().ToString().Substring(0, 8);
            var postId = Guid.NewGuid().ToString();
            var catId = "c_" + Guid.NewGuid().ToString().Substring(0, 8);

            dbContext.Users.Add(new User { Id = userId, FullName = "Liker", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });
            dbContext.Categories.Add(new Category { Id = catId, Name = "Cat" });
            dbContext.Posts.Add(new Post
            {
                Id = postId,
                Title = "Post for like",
                AuthorId = stuId,
                LikeCount = 0,
                IsPublished = true
            });
            await dbContext.SaveChangesAsync();

            return (userId, stuId, postId, catId);
        }

        private async Task CleanupDummyLikeDataAsync(DBContext dbContext, string userId, string stuId, string postId, string catId)
        {
            var likes = dbContext.Likes.Where(l => l.TargetId == postId).ToList();
            dbContext.Likes.RemoveRange(likes);

            var posts = dbContext.Posts.Where(p => p.Id == postId).ToList();
            dbContext.Posts.RemoveRange(posts);

            var cats = dbContext.Categories.Where(c => c.Id == catId).ToList();
            dbContext.Categories.RemoveRange(cats);

            var students = dbContext.Students.Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.Where(u => u.Id == userId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_01]
        // [Mục đích: ToggleLikeAsync báo lỗi ArgumentException nếu Target (Post/Course...) không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ToggleLikeAsync_ShouldThrowArgumentException_WhenTargetDoesNotExist()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new LikesService(_mockRepo.Object, dbContext);
            _mockRepo.Setup(r => r.ExistsTargetAsync("Post", "fake")).ReturnsAsync(false);

            // Act
            Func<Task> act = async () => await service.ToggleLikeAsync("stu-1", "Post", "fake");

            // Assert
            await act.Should().ThrowAsync<ArgumentException>().WithMessage("Target 'Post' với Id 'fake' không tồn tại");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_02]
        // [Mục đích: Happy Path - Toggle Like trên DB thật, kiểm tra thêm Like và xóa Like đồng thời cập nhật LikeCount]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ToggleLikeAsync_ShouldAddAndRemoveLikeAndUpdateCount_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var likesRepo = new LikesRepository(dbContext);
            var service = new LikesService(likesRepo, dbContext);

            var data = await InsertDummyPostForLikeAsync(dbContext);

            try
            {
                // 1. Like lần đầu
                var result1 = await service.ToggleLikeAsync(data.StudentId, "Post", data.PostId);
                result1.Liked.Should().BeTrue();
                result1.LikeCount.Should().Be(1);

                // Verify Post table
                var postAfterLike = await dbContext.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == data.PostId);
                postAfterLike.LikeCount.Should().Be(1);

                // 2. Like lần hai (Tức là Unlike)
                var result2 = await service.ToggleLikeAsync(data.StudentId, "Post", data.PostId);
                result2.Liked.Should().BeFalse();
                result2.LikeCount.Should().Be(0);

                // Verify Post table
                var postAfterUnlike = await dbContext.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == data.PostId);
                postAfterUnlike.LikeCount.Should().Be(0);
            }
            finally
            {
                await CleanupDummyLikeDataAsync(dbContext, data.UserId, data.StudentId, data.PostId, data.CatId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // NEW MOCK-BASED UNIT TESTS TO INCREASE COVERAGE
        // ------------------------------------------------------------------------------------------------

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_03]
        // [Mục đích: GetLikesByTargetAsync trả về danh sách like được map đầy đủ thông tin sinh viên]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetLikesByTargetAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var dbContext = GetInMemoryDatabaseContext();
            var likes = new List<Likes>
            {
                new Likes { 
                    Id = "l1", 
                    StudentId = "s1", 
                    TargetType = "Post", 
                    TargetId = "p1",
                    Student = new Student { User = new User { FullName = "Student 1", AvatarUrl = "url1" } }
                }
            };
            _mockRepo.Setup(r => r.GetLikesByTargetAsync("Post", "p1")).ReturnsAsync(likes);
            var service = new LikesService(_mockRepo.Object, dbContext);

            // Act
            var result = await service.GetLikesByTargetAsync("Post", "p1");

            // Assert
            result.Should().HaveCount(1);
            result.First().StudentName.Should().Be("Student 1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_04]
        // [Mục đích: GetAllLikesAsync trả về toàn bộ danh sách like trên hệ thống]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllLikesAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var dbContext = GetInMemoryDatabaseContext();
            var likes = new List<Likes>
            {
                new Likes { 
                    Id = "l1", 
                    StudentId = "s1", 
                    TargetType = "Post", 
                    TargetId = "p1",
                    Student = new Student { User = new User { FullName = "Student 1", AvatarUrl = "url1" } }
                }
            };
            _mockRepo.Setup(r => r.GetAllLikesAsync()).ReturnsAsync(likes);
            var service = new LikesService(_mockRepo.Object, dbContext);

            // Act
            var result = await service.GetAllLikesAsync();

            // Assert
            result.Should().HaveCount(1);
            result.First().TargetType.Should().Be("Post");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_05]
        // [Mục đích: GetLikesByStudentAsync trả về danh sách bài viết/câu hỏi mà sinh viên đã like]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetLikesByStudentAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var dbContext = GetInMemoryDatabaseContext();
            var likes = new List<Likes>
            {
                new Likes { 
                    Id = "l1", 
                    StudentId = "s1", 
                    TargetType = "Post", 
                    TargetId = "p1",
                    Student = new Student { User = new User { FullName = "Student 1", AvatarUrl = "url1" } }
                }
            };
            _mockRepo.Setup(r => r.GetLikesByStudentAsync("s1")).ReturnsAsync(likes);
            var service = new LikesService(_mockRepo.Object, dbContext);

            // Act
            var result = await service.GetLikesByStudentAsync("s1");

            // Assert
            result.Should().HaveCount(1);
            result.First().StudentId.Should().Be("s1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_06]
        // [Mục đích: UpdateLikeCountAsync cập nhật lại số lượng Like cho ForumQuestion trong database]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdateLikeCountAsync_ShouldUpdateForumQuestion()
        {
            // Arrange
            var dbContext = GetInMemoryDatabaseContext();
            var question = new ForumQuestion 
            { 
                Id = "q1", 
                LikeCount = 0, 
                StudentId = "s1", 
                Title = "Required Title" 
            };
            dbContext.ForumQuestions.Add(question);
            await dbContext.SaveChangesAsync();

            _mockRepo.Setup(r => r.CountLikesAsync("ForumQuestion", "q1")).ReturnsAsync(5);
            var service = new LikesService(_mockRepo.Object, dbContext);

            // Act
            await service.UpdateLikeCountAsync("ForumQuestion", "q1");

            // Assert
            var saved = await dbContext.ForumQuestions.FindAsync("q1");
            saved!.LikeCount.Should().Be(5);
        }

      

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_LIK_07]
        // [Mục đích: ToggleLikeAsync cho phép like một ID không tồn tại (Lỗi logic demo)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ToggleLikeAsync_NonExistentTarget_ShouldFail()
        {
            // [FAIL_EXPECTED]: LikesService.ToggleLikeAsync does not verify if the target (Post, etc.) exists.
            // Arrange
            var dbContext = GetInMemoryDatabaseContext();
            var service = new LikesService(_mockRepo.Object, dbContext);

            // Act
            Func<Task> act = async () => await service.ToggleLikeAsync("stu-1", "Post", "ghost-id");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Target không tồn tại.");
        }
    }
}
