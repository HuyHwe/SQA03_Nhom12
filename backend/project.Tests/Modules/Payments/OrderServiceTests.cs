using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using Moq;
using project.Models;
using project.Modules.Payment.DTOs;
using project.Modules.Payments.Repositories.Interfaces;
using project.Modules.Payment.Service.Interfaces;

namespace project.Tests.Modules.Payments
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _mockOrderRepo;
        private readonly Mock<ICourseRepository> _mockCourseRepo;
        private readonly Mock<IPaymentRepository> _mockPaymentRepo;

        public OrderServiceTests()
        {
            _mockOrderRepo = new Mock<IOrderRepository>();
            _mockCourseRepo = new Mock<ICourseRepository>();
            _mockPaymentRepo = new Mock<IPaymentRepository>();
        }

        private DBContext GetDatabaseContext()
        {
            // Kết nối thẳng tới Database thật (Elearning_project) đang chạy trên Docker
            var connectionString = "Server=localhost,1433;User Id=sa;Password=MatKhauBaoMat123!;Database=Elearning_project;TrustServerCertificate=True;";
            var options = new DbContextOptionsBuilder<DBContext>()
                .UseSqlServer(connectionString)
                .Options;
            return new DBContext(options);
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_01]
        // [Mục đích: Đảm bảo method ném lỗi Exception ("Order must have at least one course.") nếu giỏ hàng rỗng hoặc null]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateOrderAsync_ShouldThrowException_WhenOrderDetailsIsNull()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);
            var dto = new OrderCreateDto { OrderDetails = null };

            // Act
            Func<Task> act = async () => await service.CreateOrderAsync(dto, "student-1");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Order must have at least one course.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_02]
        // [Mục đích: Đảm bảo method ném lỗi nếu trong OrderDetails chứa Course không tồn tại hoặc có trạng thái khác "published"]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateOrderAsync_ShouldThrowException_WhenCourseIsNotPublished()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);
            
            var dto = new OrderCreateDto 
            { 
                OrderDetails = new List<OrderDetailCreateDto> { new OrderDetailCreateDto { CourseId = "invalid-course" } } 
            };

            // Trả về khóa học nhưng trạng thái là 'draft'
            _mockCourseRepo.Setup(r => r.GetCourseByIdAsync("invalid-course"))
                           .ReturnsAsync(new Course { Id = "invalid-course", Status = "draft" });

            // Act
            Func<Task> act = async () => await service.CreateOrderAsync(dto, "student-1");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Course invalid-course does not exist or is not published.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_03]
        // [Mục đích: Lấy đúng OrderResponseDto nếu OrderId tồn tại và StudentId trùng khớp với người đang đăng nhập]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnOrderResponse_WhenValidRequest()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);

            var expectedOrder = new Orders 
            { 
                Id = "order-1", 
                StudentId = "student-1", 
                TotalPrice = 500, 
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _mockOrderRepo.Setup(r => r.GetByIdAsync("order-1")).ReturnsAsync(expectedOrder);

            // Act
            var result = await service.GetOrderByIdAsync("order-1", "student-1");

            // Assert
            result.Should().NotBeNull();
            result.OrderId.Should().Be("order-1");
            result.TotalPrice.Should().Be(500);
            result.Status.Should().Be("pending");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_04]
        // [Mục đích: Ném lỗi UnauthorizedAccessException nếu sinh viên xem đơn hàng của người khác]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetOrderByIdAsync_ShouldThrowUnauthorizedAccessException_WhenStudentIdDoesNotMatch()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);

            var expectedOrder = new Orders { Id = "order-1", StudentId = "student-2" }; // Của sinh viên 2

            _mockOrderRepo.Setup(r => r.GetByIdAsync("order-1")).ReturnsAsync(expectedOrder);

            // Act
            Func<Task> act = async () => await service.GetOrderByIdAsync("order-1", "student-1"); // Sinh viên 1 đang gọi

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>().WithMessage("You don't have permission to access this order.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_05]
        // [Mục đích: Happy Path - Đảm bảo tạo đơn hàng và payment thành công và lưu thật vào DB]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateOrderAsync_ShouldModifyRealDbAndCreatePayment_HappyPath()
        {
            var dbContext = GetDatabaseContext();

            // Khởi tạo Repositories thật
            var orderRepo = new project.Modules.Payment.Repositories.Implements.OrderRepository(dbContext);
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new OrderService(orderRepo, _mockCourseRepo.Object, paymentRepo, dbContext);

            // Define IDs
            var catId = "test_cat_" + Guid.NewGuid().ToString().Substring(0,8);
            var tchUsr = "tch_usr_" + Guid.NewGuid().ToString().Substring(0,8);
            var stuUsr = "stu_usr_" + Guid.NewGuid().ToString().Substring(0,8);
            var tchId = "tch_" + Guid.NewGuid().ToString().Substring(0,8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0,8);
            var courseId = "course_" + Guid.NewGuid().ToString().Substring(0,8);

            try
            {
                // 1. Tạo dữ liệu liên kết vào DB
                dbContext.Users.Add(new User { Id = tchUsr, FullName = "T", UserName = tchUsr, Email = tchUsr + "@fake.com" });
                dbContext.Users.Add(new User { Id = stuUsr, FullName = "S", UserName = stuUsr, Email = stuUsr + "@fake.com" });
                dbContext.Teachers.Add(new Teacher { TeacherId = tchId, UserId = tchUsr });
                dbContext.Students.Add(new Student { StudentId = stuId, UserId = stuUsr });
                dbContext.Categories.Add(new Category { Id = catId, Name = "Cat" });
                dbContext.Courses.Add(new Course { Id = courseId, Title = "C", CategoryId = catId, TeacherId = tchId, Price = 100, Status = "published" });
                await dbContext.SaveChangesAsync();

                // 2. Vì Service gọi _courseRepo, ta vẫn cần mock method này trả về Course thật
                var expectedCourse = await dbContext.Courses.FindAsync(courseId);
                _mockCourseRepo.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(expectedCourse);

                var dto = new OrderCreateDto 
                { 
                    OrderDetails = new List<OrderDetailCreateDto> { new OrderDetailCreateDto { CourseId = courseId } } 
                };

                // Act - Thêm trực tiếp vào DB
                var result = await service.CreateOrderAsync(dto, stuId);

                // Assert
                result.Should().NotBeNull();
                result.TotalPrice.Should().Be(100);

                var savedOrder = await dbContext.Orders
                    .Include(o => o.OrderDetails)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == result.OrderId);

                savedOrder.Should().NotBeNull();
                savedOrder.StudentId.Should().Be(stuId);
                savedOrder.OrderDetails.Should().HaveCount(1);
                savedOrder.Payments.Should().HaveCount(1);
            }
            finally
            {
                // 3. Rollback - Dọn dẹp Database thật
                var orders = dbContext.Orders.Where(o => o.StudentId == stuId).ToList();
                var payments = dbContext.Payments.Where(p => orders.Select(o => o.Id).Contains(p.OrderId)).ToList();
                var details = dbContext.OrderDetails.Where(d => orders.Select(o => o.Id).Contains(d.OrderId)).ToList();

                dbContext.Payments.RemoveRange(payments);
                dbContext.OrderDetails.RemoveRange(details);
                dbContext.Orders.RemoveRange(orders);

                var courses = dbContext.Courses.Where(c => c.Id == courseId).ToList();
                dbContext.Courses.RemoveRange(courses);

                var categories = dbContext.Categories.Where(c => c.Id == catId).ToList();
                dbContext.Categories.RemoveRange(categories);

                var students = dbContext.Students.Where(s => s.StudentId == stuId).ToList();
                dbContext.Students.RemoveRange(students);

                var teachers = dbContext.Teachers.Where(t => t.TeacherId == tchId).ToList();
                dbContext.Teachers.RemoveRange(teachers);

                var users = dbContext.Users.Where(u => u.Id == tchUsr || u.Id == stuUsr).ToList();
                dbContext.Users.RemoveRange(users);

                await dbContext.SaveChangesAsync();
            }
        }
        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_06]
        // [Mục đích: CreateOrderAsync ném lỗi nếu OrderDetails là null]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateOrderAsync_ShouldThrowException_WhenOrderDetailsIsNull2()
        {
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);

            var dto = new OrderCreateDto { OrderDetails = null };

            Func<Task> act = async () => await service.CreateOrderAsync(dto, "student-1");

            await act.Should().ThrowAsync<Exception>().WithMessage("Order must have at least one course.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_07]
        // [Mục đích: CreateOrderAsync ném lỗi nếu OrderDetails rỗng]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task CreateOrderAsync_ShouldThrowException_WhenOrderDetailsIsEmpty()
        {
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);

            var dto = new OrderCreateDto { OrderDetails = new List<OrderDetailCreateDto>() };

            Func<Task> act = async () => await service.CreateOrderAsync(dto, "student-1");

            await act.Should().ThrowAsync<Exception>().WithMessage("Order must have at least one course.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_OS_08]
        // [Mục đích: GetOrderByIdAsync trả về null nếu Order không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnNull_WhenOrderNotFound()
        {
            var dbContext = GetDatabaseContext();
            var service = new OrderService(_mockOrderRepo.Object, _mockCourseRepo.Object, _mockPaymentRepo.Object, dbContext);

            _mockOrderRepo.Setup(r => r.GetByIdAsync("fake")).ReturnsAsync((Orders)null);

            var result = await service.GetOrderByIdAsync("fake", "student-1");

            result.Should().BeNull();
        }
    }
}
