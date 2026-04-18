using System;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;
using FluentAssertions;
using Moq;
using project.Models;
using project.Modules.Payments.DTOs;
using project.Modules.Payments.Repositories.Interfaces;
using project.Modules.Payments.Service.Implements;

namespace project.Tests.Modules.Payments
{
    public class PaymentServiceTests
    {
        private readonly Mock<IPaymentRepository> _mockPaymentRepo;
        private readonly Mock<IConfiguration> _mockConfig;

        public PaymentServiceTests()
        {
            _mockPaymentRepo = new Mock<IPaymentRepository>();
            _mockConfig = new Mock<IConfiguration>();
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
        // [ID: SERV_PS_01]
        // [Mục đích: Đảm bảo method ném lỗi ("Payment not found.") nếu paymentId không tồn tại trong DB]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GeneratePaymentQrAsync_ShouldThrowException_WhenPaymentNotFound()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new PaymentService(_mockPaymentRepo.Object, dbContext, _mockConfig.Object);

            _mockPaymentRepo.Setup(r => r.GetByIdAsync("invalid-payment")).ReturnsAsync((Payment)null);

            // Act
            Func<Task> act = async () => await service.GeneratePaymentQrAsync("invalid-payment", "student-1");

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Payment not found.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_02]
        // [Mục đích: Đảm bảo method ném lỗi nếu sinh viên cố gắng lấy mã QR của một hóa đơn không thuộc về mình]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GeneratePaymentQrAsync_ShouldThrowException_WhenStudentIdDoesNotMatch()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new PaymentService(_mockPaymentRepo.Object, dbContext, _mockConfig.Object);

            var order = new Orders { Id = "order-1", StudentId = "student-2" }; // Hóa đơn của sinh viên 2
            var payment = new Payment { Id = "pay-1", OrderId = order.Id, Order = order };

            _mockPaymentRepo.Setup(r => r.GetByIdAsync("pay-1")).ReturnsAsync(payment);

            // Act
            Func<Task> act = async () => await service.GeneratePaymentQrAsync("pay-1", "student-1"); // Sinh viên 1 cố ý truy cập

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("You are not allowed to access this payment.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_03]
        // [Mục đích: Ném lỗi nếu webhook của SePay gọi tới nhưng là loại giao dịch chi tiền ("out") thay vì thu tiền ("in")]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenTransferTypeIsNotIn()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new PaymentService(_mockPaymentRepo.Object, dbContext, _mockConfig.Object);

            var dto = new SepayWebhookDto
            {
                TransferType = "out", // Giao dịch chi ra
                TransferAmount = 100000
            };

            // Act
            Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Only process incoming transactions.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_04]
        // [Mục đích: Ném lỗi nếu số tiền gửi qua webhook SePay <= 0 (Không hợp lệ)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenAmountIsZeroOrLess()
        {
            // Arrange
            var dbContext = GetDatabaseContext();
            var service = new PaymentService(_mockPaymentRepo.Object, dbContext, _mockConfig.Object);

            var dto = new SepayWebhookDto
            {
                TransferType = "in",
                TransferAmount = 0
            };

            // Act
            Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid transfer amount.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_05]
        // [Mục đích: Happy Path - Đảm bảo SePay Webhook xử lý thành công, update Order, sinh Payment và khóa học]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldUpdateOrderAndCreateEnrollment_HappyPath()
        {
            var dbContext = GetDatabaseContext();

            // Khởi tạo Service sử dụng Repository thật cho test này
            // PaymentRepository thật sẽ thao tác với DB
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var catId = "test_cat_" + Guid.NewGuid().ToString().Substring(0,8);
            var tchUsr = "tch_usr_" + Guid.NewGuid().ToString().Substring(0,8);
            var stuUsr = "stu_usr_" + Guid.NewGuid().ToString().Substring(0,8);
            var tchId = "tch_" + Guid.NewGuid().ToString().Substring(0,8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0,8);
            var courseId = "course_" + Guid.NewGuid().ToString().Substring(0,8);
            var orderId = "order_" + Guid.NewGuid().ToString().Substring(0,8);

            try
            {
                // 1. Tạo Data giả trong DB thật
                dbContext.Users.Add(new User { Id = tchUsr, FullName = "T", UserName = tchUsr, Email = tchUsr + "@fake.com" });
                dbContext.Users.Add(new User { Id = stuUsr, FullName = "S", UserName = stuUsr, Email = stuUsr + "@fake.com" });
                dbContext.Teachers.Add(new Teacher { TeacherId = tchId, UserId = tchUsr });
                dbContext.Students.Add(new Student { StudentId = stuId, UserId = stuUsr });
                dbContext.Categories.Add(new Category { Id = catId, Name = "Cat" });
                dbContext.Courses.Add(new Course { Id = courseId, Title = "C", CategoryId = catId, TeacherId = tchId, Price = 100000, Status = "published" });
                
                dbContext.Orders.Add(new Orders { Id = orderId, StudentId = stuId, TotalPrice = 100000, Status = "pending", CreatedAt = DateTime.UtcNow });
                dbContext.OrderDetails.Add(new OrderDetail { Id = Guid.NewGuid().ToString(), OrderId = orderId, CourseId = courseId, Price = 100000 });
                
                await dbContext.SaveChangesAsync();

                // 2. Định dạng mã Code như SePay gửi vể
                // Format ELN<orderId>
                var sepayDto = new SepayWebhookDto
                {
                    Id = 99999,
                    Code = "ELN" + orderId.Replace("-", ""),
                    Content = "CHUYEN KHOAN ELN" + orderId,
                    TransferAmount = 100000,
                    TransferType = "in",
                    ReferenceCode = "MB123456" // transactionId
                };

                // Act
                var result = await service.HandleSepayWebhookAsync(sepayDto);

                // Assert
                result.Should().BeTrue();

                // Kiểm tra lại DB xem Order có thành 'paid' chưa?
                var savedOrder = await dbContext.Orders.FindAsync(orderId);
                savedOrder.Should().NotBeNull();
                savedOrder.Status.Should().Be("paid");

                // Kiểm tra Payment đã sinh ra chưa?
                var savedPayment = await dbContext.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
                savedPayment.Should().NotBeNull();
                savedPayment.Amount.Should().Be(100000);
                savedPayment.TransactionId.Should().Be("MB123456");

                // Kiểm tra học sinh đã được Enroll vào khoá học chưa?
                var enrollment = await dbContext.Enrollments.FirstOrDefaultAsync(e => e.StudentId == stuId && e.CourseId == courseId);
                enrollment.Should().NotBeNull();
                enrollment.Status.Should().Be("active");
            }
            finally
            {
                // 3. Dọn dẹp Database thật
                var enrollments = dbContext.Enrollments.Where(e => e.StudentId == stuId).ToList();
                dbContext.Enrollments.RemoveRange(enrollments);

                var dbOrders = dbContext.Orders.Where(o => o.StudentId == stuId).ToList();
                var dbPayments = dbContext.Payments.Where(p => dbOrders.Select(o => o.Id).Contains(p.OrderId)).ToList();
                var dbDetails = dbContext.OrderDetails.Where(d => dbOrders.Select(o => o.Id).Contains(d.OrderId)).ToList();

                dbContext.Payments.RemoveRange(dbPayments);
                dbContext.OrderDetails.RemoveRange(dbDetails);
                dbContext.Orders.RemoveRange(dbOrders);

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
    }
}
