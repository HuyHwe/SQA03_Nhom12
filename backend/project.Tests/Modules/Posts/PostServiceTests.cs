using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using project.Models;
using project.Models.Posts;
using project.Models.Posts.DTOs;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class PostServiceTests
    {
        private readonly Mock<IPostRepository> _mockPostRepo;

        public PostServiceTests()
        {
            _mockPostRepo = new Mock<IPostRepository>();
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

        private async Task<(string UserId, string StudentId, string PostId)> InsertDummyPostAsync(DBContext dbContext, bool isDeleted = false, bool isPublished = true)
        {
            var userId = "user_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0, 8);
            var postId = Guid.NewGuid().ToString();

            dbContext.Users.Add(new User { Id = userId, FullName = "Dummy User", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });

            var post = new Post
            {
                Id = postId,
                Title = "Test Post",
                ContentJson = "{\"blocks\":[]}",
                ThumbnailUrl = "http://test.com/img.jpg",
                Tags = "Test",
                IsPublished = isPublished,
                IsDeleted = isDeleted,
                DeletedAt = isDeleted ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AuthorId = stuId,
                ViewCount = 0,
                LikeCount = 0,
                DiscussionCount = 0
            };
            dbContext.Posts.Add(post);
            await dbContext.SaveChangesAsync();

            return (userId, stuId, postId);
        }

        private async Task CleanupDummyPostAsync(DBContext dbContext, string stuId, string userId, string postId)
        {
            var posts = dbContext.Posts.IgnoreQueryFilters().Where(p => p.Id == postId).ToList();
            dbContext.Posts.RemoveRange(posts);

            var students = dbContext.Students.IgnoreQueryFilters().Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.IgnoreQueryFilters().Where(u => u.Id == userId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_01]
        // [Mục đích: GetPostByIdAsync trả về Null nếu bài viết không tồn tại (sử dụng Mock Repo)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetPostByIdAsync_ShouldReturnNull_WhenPostDoesNotExist()
        {
            // Arrange
            var service = new PostService(_mockPostRepo.Object);
            _mockPostRepo.Setup(r => r.GetPostByIdAsync(It.IsAny<string>())).ReturnsAsync((Post)null);

            // Act
            var result = await service.GetPostByIdAsync("invalid-id");

            // Assert
            result.Should().BeNull();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_02]
        // [Mục đích: GetPostByIdAsync trả về và map đúng định dạng PostDetailDto nếu ID hợp lệ]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetPostByIdAsync_ShouldReturnDto_WhenPostExists()
        {
            // Arrange
            var service = new PostService(_mockPostRepo.Object);
            var expectedPost = new Post
            {
                Id = "post-1",
                Title = "Knowledge Sharing",
                Tags = "Coding",
                IsPublished = true,
                Student = new Student { User = new User { FullName = "Huy" } }
            };

            _mockPostRepo.Setup(r => r.GetPostByIdAsync("post-1")).ReturnsAsync(expectedPost);

            // Act
            var result = await service.GetPostByIdAsync("post-1");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("post-1");
            result.Title.Should().Be("Knowledge Sharing");
            result.Tags.Should().Contain("Coding");
            result.AuthorName.Should().Be("Huy");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_03]
        // [Mục đích: Báo lỗi "Post not found or has been deleted" khi sinh viên cố gắng Update bài báo không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdatePostAsync_ShouldThrowException_WhenPostNotFound()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var dto = new PostUpdateDto { Title = "New Title" };

            Func<Task> act = async () => await service.UpdatePostAsync("non-exist-id", dto, "author-id");

            await act.Should().ThrowAsync<Exception>().WithMessage("Post not found or has been deleted");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_04]
        // [Mục đích: Báo lỗi "You are not the author" khi 1 người cố gắng sửa bài đăng của người khác]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdatePostAsync_ShouldThrowException_WhenNotAuthor()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                var dto = new PostUpdateDto { Title = "Hacked Title" };

                // "hacker-student" cố gắng sửa bài viết của data.StudentId
                Func<Task> act = async () => await service.UpdatePostAsync(data.PostId, dto, "hacker-student");

                await act.Should().ThrowAsync<Exception>().WithMessage("You are not the author of this post: hacker-student");
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_05]
        // [Mục đích: Happy Path - Update bài viết trên hệ thống DB SQL Server thật thành công]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdatePostAsync_ShouldUpdateTitleAndContent_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                var dto = new PostUpdateDto 
                { 
                    Title = "Updated Title",
                    ContentJson = "{\"blocks\":[{\"type\":\"text\",\"text\":\"hello\"}]}",
                    IsPublished = false // Tắt chế độ public
                };

                var result = await service.UpdatePostAsync(data.PostId, dto, data.StudentId);

                // Kiểm tra Object trả về từ Service có map đúng dữ liệu chưa
                result.Should().NotBeNull();
                result.Title.Should().Be("Updated Title");
                result.IsPublished.Should().BeFalse();

                // Kiểm tra trực tiếp vào DB 
                var savedPost = await dbContext.Posts.FindAsync(data.PostId);
                savedPost.Title.Should().Be("Updated Title");
                savedPost.ContentJson.Should().Be("{\"blocks\":[{\"type\":\"text\",\"text\":\"hello\"}]}");
                savedPost.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_06]
        // [Mục đích: Xóa mềm bài viết (Hard delete là xóa mẹo). Cờ IsDeleted phải biến thành True trên DB thật]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task SoftDeletePostAsync_ShouldSetIsDeletedToTrue_WhenAuthorRequests()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                var result = await service.SoftDeletePostAsync(data.PostId, data.StudentId);
                result.Should().BeTrue();

                // Đảm bảo cờ IsDeleted bật lên trong data
                var savedPost = await dbContext.Posts.FindAsync(data.PostId);
                savedPost.IsDeleted.Should().BeTrue();
                savedPost.DeletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_07]
        // [Mục đích: Báo lỗi khi khôi phục bài viết (Restore) nhưng bài viết đó vốn KHÔNG BỊ XÓA (IsDeleted = false)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestorePostAsync_ShouldThrowException_WhenPostIsNotDeleted()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            // isDeleted = false
            var data = await InsertDummyPostAsync(dbContext, isDeleted: false);

            try
            {
                Func<Task> act = async () => await service.RestorePostAsync(data.PostId, data.StudentId);
                await act.Should().ThrowAsync<Exception>().WithMessage("Post is not deleted");
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_08]
        // [Mục đích: Happy Path - Khôi phục bài viết xóa mềm thành công, biến cờ IsDeleted=false trên DB thật]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestorePostAsync_ShouldSetIsDeletedToFalse_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            // Bài viết đã bị xóa mềm trước đó (IsDeleted = true)
            var data = await InsertDummyPostAsync(dbContext, isDeleted: true);

            try
            {
                var result = await service.RestorePostAsync(data.PostId, data.StudentId);
                
                result.Should().NotBeNull();
                result.IsDeleted.Should().BeFalse();

                var savedPost = await dbContext.Posts.FindAsync(data.PostId);
                savedPost.IsDeleted.Should().BeFalse();
                savedPost.DeletedAt.Should().BeNull();
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_09]
        // [Mục đích: Báo lỗi HardDelete nếu sinh viên không phải chủ bài viết (không có quyền Admin)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HardDeletePostAsync_ShouldThrowException_WhenNotAuthorAndNotAdmin()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                // Gọi với student fake, isAdmin = false
                Func<Task> act = async () => await service.HardDeletePostAsync(data.PostId, "fake-student", isAdmin: false);
                await act.Should().ThrowAsync<Exception>().WithMessage("You are not the author of this post");
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_10]
        // [Mục đích: Happy Path - Xóa vĩnh viễn dòng dữ liệu của bài đăng khỏi Database thật]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HardDeletePostAsync_ShouldRemoveRecordFromDb_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                // Sinh viên chính thức xóa bài
                var result = await service.HardDeletePostAsync(data.PostId, data.StudentId, isAdmin: false);
                result.Should().BeTrue();

                // Đảm bảo Post thực sự đã bốc hơi khỏi bảng Posts (Dù dùng IgnoreQueryFilters)
                var savedPost = await dbContext.Posts.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == data.PostId);
                savedPost.Should().BeNull();
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_11]
        // [Mục đích: Tăng lượt ViewCount của Post bằng UpdateQuery, phải phản ánh dưới Database]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task IncreaseViewCountAsync_ShouldReturnTrue_WhenPostExistsAndIsNotDeleted()
        {
            var dbContext = GetDatabaseContext();
            var repo = new PostRepository(dbContext);
            var service = new PostService(repo);

            var data = await InsertDummyPostAsync(dbContext);

            try
            {
                // Bài post khi insert mặc định ViewCount = 0
                var result = await service.IncreaseViewCountAsync(data.PostId);
                result.Should().BeTrue();

                var savedPost = await dbContext.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == data.PostId);
                savedPost.ViewCount.Should().Be(1);
            }
            finally
            {
                await CleanupDummyPostAsync(dbContext, data.StudentId, data.UserId, data.PostId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // NEW MOCK-BASED UNIT TESTS TO INCREASE COVERAGE
        // ------------------------------------------------------------------------------------------------

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_12]
        // [Mục đích: GetAllPostsAsync trả về danh sách các DTO bài viết đã được map đầy đủ]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllPostsAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Id = "p1", Title = "Post 1", Student = new Student { User = new User { FullName = "Author 1" } } },
                new Post { Id = "p2", Title = "Post 2", Student = new Student { User = new User { FullName = "Author 2" } } }
            };
            _mockPostRepo.Setup(r => r.GetAllPostsAsync()).ReturnsAsync(posts);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.GetAllPostsAsync();

            // Assert
            result.Should().HaveCount(2);
            result.First().Title.Should().Be("Post 1");
            result.First().AuthorName.Should().Be("Author 1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_13]
        // [Mục đích: GetPagedPostsByTagsAsync trả về dữ liệu phân trang và tổng số bài viết theo tag]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetPagedPostsByTagsAsync_ShouldReturnPagedMappedDtos()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Id = "p1", Title = "Post 1", Student = new Student { User = new User { FullName = "Author 1" } } }
            };
            _mockPostRepo.Setup(r => r.GetPagingAsync(1, 10, It.IsAny<List<string>>()))
                .ReturnsAsync((posts, 1));
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var (items, totalRecords) = await service.GetPagedPostsByTagsAsync(1, 10, new List<string> { "Tag1" });

            // Assert
            items.Should().HaveCount(1);
            totalRecords.Should().Be(1);
            items.First().Title.Should().Be("Post 1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_14]
        // [Mục đích: GetPostsByMemberIdAsync trả về danh sách bài viết công khai của một thành viên]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetPostsByMemberIdAsync_ShouldReturnMappedDtosForMember()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Id = "p1", Title = "Member Post", AuthorId = "m1", Student = new Student { User = new User { FullName = "Member" } } }
            };
            _mockPostRepo.Setup(r => r.GetPostsByMemberIdAsync("m1")).ReturnsAsync(posts);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.GetPostsByMemberIdAsync("m1");

            // Assert
            result.Should().HaveCount(1);
            result.First().AuthorId.Should().Be("m1");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_15]
        // [Mục đích: SearchPostsByTagAsync cho phép tìm kiếm bài viết theo tag cụ thể]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task SearchPostsByTagAsync_ShouldReturnMappedDtosForTag()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Id = "p1", Title = "Tagged Post", Tags = "TagA", Student = new Student { User = new User { FullName = "Author" } } }
            };
            _mockPostRepo.Setup(r => r.SearchPostsByTagAsync("TagA")).ReturnsAsync(posts);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.SearchPostsByTagAsync("TagA");

            // Assert
            result.Should().HaveCount(1);
            result.First().Tags.Should().Be("TagA");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_16]
        // [Mục đích: GetAllPostByIdAsync trả về chi tiết bài viết (bao gồm cả bài đã bị xóa mềm)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllPostByIdAsync_ShouldReturnDto_WhenPostExists()
        {
            // Arrange
            var post = new Post { Id = "p1", Title = "Detail Post", Student = new Student { User = new User { FullName = "Author" } } };
            _mockPostRepo.Setup(r => r.GetAllPostByIdAsync("p1")).ReturnsAsync(post);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.GetAllPostByIdAsync("p1");

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be("p1");
            result.AuthorName.Should().Be("Author");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_17]
        // [Mục đích: CreatePostAsync tạo bài viết mới và trả về DTO tương ứng]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreatePostAsync_ShouldReturnCreatedDto()
        {
            // Arrange
            var dto = new PostCreateDto { Title = "New Post", ContentJson = "{}", IsPublished = true };
            _mockPostRepo.Setup(r => r.AddPostAsync(It.IsAny<Post>()))
                .ReturnsAsync((Post p) => { p.Id = "new-id"; return p; });
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.CreatePostAsync(dto, "author-1", "Author Name");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("new-id");
            result.Title.Should().Be("New Post");
            result.AuthorName.Should().Be("Author Name");
            _mockPostRepo.Verify(r => r.AddPostAsync(It.Is<Post>(p => p.Title == "New Post")), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_18]
        // [Mục đích: RestorePostAsync cập nhật IsDeleted thành False cho bài viết]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RestorePostAsync_ShouldSetIsDeletedToFalse_MockRepo()
        {
            // Arrange
            var post = new Post { Id = "p1", AuthorId = "a1", IsDeleted = true };
            _mockPostRepo.Setup(r => r.GetAllPostByIdAsync("p1")).ReturnsAsync(post);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.RestorePostAsync("p1", "a1");

            // Assert
            result.IsDeleted.Should().BeFalse();
            _mockPostRepo.Verify(r => r.UpdateAsync(It.Is<Post>(p => p.IsDeleted == false)), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_19]
        // [Mục đích: GetDeletedPostsByAuthorAsync trả về danh sách bài viết đã bị xóa mềm của tác giả]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetDeletedPostsByAuthorAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Id = "p1", AuthorId = "a1", IsDeleted = true, Student = new Student { User = new User { FullName = "Author" } } }
            };
            _mockPostRepo.Setup(r => r.GetPostsByAuthorDeletedAsync("a1")).ReturnsAsync(posts);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            var result = await service.GetDeletedPostsByAuthorAsync("a1");

            // Assert
            result.Should().HaveCount(1);
            result.First().IsDeleted.Should().BeTrue();
        }

        // ================= FAILING TESTS (POOR CODE DEMO) =================

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_POS_20]
        // [Mục đích: UpdatePostAsync cho phép cập nhật tiêu đề thành khoảng trắng (Lỗi logic demo)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task UpdatePostAsync_WhitespaceTitle_ShouldFail()
        {
            // [FAIL_EXPECTED]: PostService.UpdatePostAsync lacks validation for empty/whitespace titles.
            // Arrange
            var post = new Post { Id = "p-1", AuthorId = "a-1", Title = "Original" };
            _mockPostRepo.Setup(r => r.GetAllPostByIdAsync("p-1")).ReturnsAsync(post);
            _mockPostRepo.Setup(r => r.UpdateAsync(It.IsAny<Post>())).Returns(Task.CompletedTask);
            var service = new PostService(_mockPostRepo.Object);

            // Act
            // This SHOULD throw an exception if the code was good, but it won't.
            Func<Task> act = async () => await service.UpdatePostAsync("p-1", new PostUpdateDto { Title = "   " }, "a-1");

            // Assert
            // This assertion will FAIL because the code doesn't throw.
            await act.Should().ThrowAsync<Exception>().WithMessage("Tiêu đề không được để trống.");
        }
    }
}
