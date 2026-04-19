using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using project.Modules.Posts.DTOs;
using project.Modules.Posts.Repositories.Interfaces;
using project.Modules.Posts.Services.Implements;
using Xunit;

namespace project.Tests.Modules.Posts
{
    public class StudentStatsServiceTests
    {
        private readonly Mock<IStudentStatsRepository> _mockRepo;

        public StudentStatsServiceTests()
        {
            _mockRepo = new Mock<IStudentStatsRepository>();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_STS_01]
        // [Mục đích: Kiểm tra tính đúng đắn của việc gọi Repository]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task ServiceMethods_ShouldDelegateToRepository()
        {
            // Arrange
            var service = new StudentStatsService(_mockRepo.Object);
            var stats = new List<StudentStatsDto> { new StudentStatsDto { StudentId = "stu-1" } };
            var scores = new int[] { 100, 50, 50 };

            _mockRepo.Setup(r => r.GetStudentStatsAsync(It.IsAny<int?>())).ReturnsAsync(stats);
            _mockRepo.Setup(r => r.IsTeacherAsync("stu-1")).ReturnsAsync(true);
            _mockRepo.Setup(r => r.GetStudentScoresAsync("stu-1")).ReturnsAsync(scores);

            // Act
            var statsResult = await service.GetStatsAsync(10);
            var isTeacherResult = await service.IsTeacherAsync("stu-1");
            var scoresResult = await service.GetStudentScoresAsync("stu-1");

            // Assert
            statsResult.Should().BeEquivalentTo(stats);
            isTeacherResult.Should().BeTrue();
            scoresResult.Should().BeEquivalentTo(scores);

            _mockRepo.Verify(r => r.GetStudentStatsAsync(10), Times.Once);
            _mockRepo.Verify(r => r.IsTeacherAsync("stu-1"), Times.Once);
            _mockRepo.Verify(r => r.GetStudentScoresAsync("stu-1"), Times.Once);
        }
    }
}
