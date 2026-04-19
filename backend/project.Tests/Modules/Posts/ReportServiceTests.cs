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
using project.Modules.Posts.Repositories.Implements;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class ReportServiceTests
    {
        private readonly Mock<IReportRepository> _mockRepo;

        public ReportServiceTests()
        {
            _mockRepo = new Mock<IReportRepository>();
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

        private async Task<(string UserId, string StudentId)> CreateDummyStudent(DBContext dbContext)
        {
            var userId = "u_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "s_" + Guid.NewGuid().ToString().Substring(0, 8);
            dbContext.Users.Add(new User { Id = userId, FullName = "Reporter", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });
            await dbContext.SaveChangesAsync();
            return (userId, stuId);
        }

        private async Task CleanupReportData(DBContext dbContext, string userId, string stuId)
        {
            var reports = dbContext.Reports.Where(r => r.ReporterId == stuId).ToList();
            dbContext.Reports.RemoveRange(reports);

            var students = dbContext.Students.Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.Where(u => u.Id == userId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_01]
        // [Mục đích: ApproveAsync ném lỗi nếu Report không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ApproveAsync_ShouldThrowException_WhenReportNotFound()
        {
            // Arrange
            var service = new ReportService(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync("fake")).ReturnsAsync((Reports)null);

            // Act
            Func<Task> act = async () => await service.ApproveAsync("fake");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Report not found");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_02]
        // [Mục đích: Happy Path - Luồng Tạo báo cáo -> Duyệt báo cáo -> Xóa báo cáo trên DB thật SQL Server]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task Report_FullFlow_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var reportRepo = new ReportRepository(dbContext);
            var service = new ReportService(reportRepo);

            var data = await CreateDummyStudent(dbContext);

            try
            {
                // 1. Create
                var dto = new CreateReportDto
                {
                    TargetType = "Post",
                    TargetTypeId = "post-123",
                    Reason = "Spam",
                    Description = "Very annoying"
                };
                await service.CreateReportAsync(data.StudentId, dto);

                var savedReport = await dbContext.Reports.FirstOrDefaultAsync(r => r.ReporterId == data.StudentId);
                savedReport.Should().NotBeNull();
                savedReport.Status.Should().Be("Pending");

                // 2. Approve
                await service.ApproveAsync(savedReport.Id);
                var approvedReport = await dbContext.Reports.FindAsync(savedReport.Id);
                approvedReport.Status.Should().Be("Resolved");

                // 3. Reject
                await service.RejectAsync(savedReport.Id);
                var rejectedReport = await dbContext.Reports.FindAsync(savedReport.Id);
                rejectedReport.Status.Should().Be("Rejected");

                // 4. Delete
                await service.DeleteReportAsync(savedReport.Id);
                var deletedReport = await dbContext.Reports.FindAsync(savedReport.Id);
                deletedReport.Should().BeNull();
            }
            finally
            {
                await CleanupReportData(dbContext, data.UserId, data.StudentId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // NEW MOCK-BASED UNIT TESTS TO INCREASE COVERAGE
        // ------------------------------------------------------------------------------------------------

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_03]
        // [Mục đích: CreateReportAsync gọi phương thức Add của Repository và lưu thay đổi thành công]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateReportAsync_ShouldCallRepoAdd()
        {
            // Arrange
            var dto = new CreateReportDto { TargetType = "Post", TargetTypeId = "p1", Reason = "Reason", Description = "Desc" };
            var service = new ReportService(_mockRepo.Object);

            // Act
            await service.CreateReportAsync("reporter-1", dto);

            // Assert
            _mockRepo.Verify(r => r.AddAsync(It.Is<Reports>(rep => 
                rep.ReporterId == "reporter-1" && 
                rep.TargetType == "Post" && 
                rep.Status == "Pending")), Times.Once);
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_04]
        // [Mục đích: GetAllAsync trả về danh sách các DTO đã được map từ Model]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetAllAsync_ShouldReturnMappedDtos()
        {
            // Arrange
            var reports = new List<Reports>
            {
                new Reports { Id = "r1", ReporterId = "s1", TargetType = "Post", TargetTypeId = "p1", Reason = "R", Status = "Pending" }
            };
            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(reports);
            var service = new ReportService(_mockRepo.Object);

            // Act
            var result = await service.GetAllAsync();

            // Assert
            result.Should().HaveCount(1);
            result.First().Id.Should().Be("r1");
            result.First().TargetType.Should().Be("Post");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_05]
        // [Mục đích: ApproveAsync cập nhật trạng thái báo cáo thành "Resolved"]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ApproveAsync_ShouldUpdateStatusToResolved()
        {
            // Arrange
            var report = new Reports { Id = "r1", Status = "Pending" };
            _mockRepo.Setup(r => r.GetByIdAsync("r1")).ReturnsAsync(report);
            var service = new ReportService(_mockRepo.Object);

            // Act
            await service.ApproveAsync("r1");

            // Assert
            report.Status.Should().Be("Resolved");
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_06]
        // [Mục đích: RejectAsync cập nhật trạng thái báo cáo thành "Rejected"]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task RejectAsync_ShouldUpdateStatusToRejected()
        {
            // Arrange
            var report = new Reports { Id = "r1", Status = "Pending" };
            _mockRepo.Setup(r => r.GetByIdAsync("r1")).ReturnsAsync(report);
            var service = new ReportService(_mockRepo.Object);

            // Act
            await service.RejectAsync("r1");

            // Assert
            report.Status.Should().Be("Rejected");
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_07]
        // [Mục đích: DeleteReportAsync gọi phương thức Delete của Repository]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task DeleteReportAsync_ShouldCallRepoDelete()
        {
            // Arrange
            var report = new Reports { Id = "r1" };
            _mockRepo.Setup(r => r.GetByIdAsync("r1")).ReturnsAsync(report);
            var service = new ReportService(_mockRepo.Object);

            // Act
            await service.DeleteReportAsync("r1");

            // Assert
            _mockRepo.Verify(r => r.Delete(report), Times.Once);
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // ================= FAILING TESTS (POOR CODE DEMO) =================

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_REP_08]
        // [Mục đích: ApproveAsync cho phép duyệt báo cáo đã bị từ chối (Lỗi logic demo)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ApproveAsync_AlreadyRejected_ShouldFail()
        {
            // [FAIL_EXPECTED]: ReportService.ApproveAsync allows resolving a report that was already Rejected.
            // Arrange
            var report = new Reports { Id = "r-1", Status = "Rejected" };
            _mockRepo.Setup(r => r.GetByIdAsync("r-1")).ReturnsAsync(report);
            var service = new ReportService(_mockRepo.Object);

            // Act
            // This SHOULD throw an exception to prevent illegal state transition, but it won't.
            Func<Task> act = async () => await service.ApproveAsync("r-1");

            // Assert
            // This assertion will FAIL because the code doesn't throw.
            await act.Should().ThrowAsync<Exception>().WithMessage("Chỉ có thể duyệt báo cáo đang chờ.");
        }
    }
}
