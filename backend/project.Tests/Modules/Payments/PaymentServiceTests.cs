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

        // ================= HELPER METHODS: Quản lý Test Data =================

        private async Task<(string UserId, string StudentId, string OrderId)> InsertDummyOrderAsync(DBContext dbContext, string status, decimal totalPrice)
        {
            var userId = "user_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0, 8);
            var orderId = Guid.NewGuid().ToString();

            dbContext.Users.Add(new User { Id = userId, FullName = "U", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });
            dbContext.Orders.Add(new Orders { Id = orderId, StudentId = stuId, TotalPrice = totalPrice, Status = status });
            await dbContext.SaveChangesAsync();

            return (userId, stuId, orderId);
        }

        private async Task<(string UserId, string StudentId, string OrderId, string PaymentId, string TransactionId)> InsertDummyOrderWithPaymentAsync(DBContext dbContext, string orderStatus)
        {
            var userId = "user_" + Guid.NewGuid().ToString().Substring(0, 8);
            var stuId = "stu_" + Guid.NewGuid().ToString().Substring(0, 8);
            var orderId = Guid.NewGuid().ToString();
            var paymentId = Guid.NewGuid().ToString();
            var txId = "TX_" + Guid.NewGuid().ToString().Substring(0, 8);

            dbContext.Users.Add(new User { Id = userId, FullName = "U", UserName = userId, Email = userId + "@fake.com" });
            dbContext.Students.Add(new Student { StudentId = stuId, UserId = userId });
            dbContext.Orders.Add(new Orders { Id = orderId, StudentId = stuId, TotalPrice = 100000, Status = orderStatus });
            dbContext.Payments.Add(new Payment { Id = paymentId, OrderId = orderId, Amount = 100000, TransactionId = txId });
            await dbContext.SaveChangesAsync();

            return (userId, stuId, orderId, paymentId, txId);
        }

        private async Task CleanupDummyOrderAsync(DBContext dbContext, string stuId, string userId)
        {
            var orders = dbContext.Orders.Where(o => o.StudentId == stuId).ToList();
            var dbPayments = dbContext.Payments.Where(p => orders.Select(o => o.Id).Contains(p.OrderId)).ToList();
            var dbDetails = dbContext.OrderDetails.Where(d => orders.Select(o => o.Id).Contains(d.OrderId)).ToList();

            dbContext.Payments.RemoveRange(dbPayments);
            dbContext.OrderDetails.RemoveRange(dbDetails);
            dbContext.Orders.RemoveRange(orders);

            var students = dbContext.Students.Where(s => s.StudentId == stuId).ToList();
            dbContext.Students.RemoveRange(students);

            var users = dbContext.Users.Where(u => u.Id == userId).ToList();
            dbContext.Users.RemoveRange(users);

            await dbContext.SaveChangesAsync();
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_06]
        // [Mục đích: Báo lỗi nếu mã giao dịch không trích xuất được OrderId từ Content]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenOrderIdCannotBeExtracted()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var dto = new SepayWebhookDto
            {
                TransferType = "in",
                TransferAmount = 100000,
                Content = "CHUYEN KHOAN HOC PHI" // Không chứa ký pháp ELN
            };

            Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);

            await act.Should().ThrowAsync<Exception>().WithMessage("Cannot extract OrderId from transaction. Format: ELN<orderId>");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_07]
        // [Mục đích: Báo lỗi nếu mã đơn hàng hợp lệ nhưng không tồn tại trong CSDL]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenOrderNotFound()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var orderId = Guid.NewGuid().ToString();

            var dto = new SepayWebhookDto
            {
                TransferType = "in",
                TransferAmount = 100000,
                Content = $"ELN{orderId}"
            };

            Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);

            await act.Should().ThrowAsync<Exception>().WithMessage($"Order {orderId} not found.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_08]
        // [Mục đích: Idempotent - Giao dịch webhook đi vào lần 2 thì bỏ qua không làm thêm gì cả thay vì ném lỗi]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldReturnTrueImmediately_WhenOrderIsAlreadyPaid()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "paid", 100000);

            try
            {
                var dto = new SepayWebhookDto
                {
                    TransferType = "in",
                    TransferAmount = 100000,
                    Content = $"ELN{data.OrderId}"
                };

                var result = await service.HandleSepayWebhookAsync(dto);
                result.Should().BeTrue();
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_09]
        // [Mục đích: Báo lỗi nếu nội dung chuyển tiếp thiếu tiền (Amount mismatch)]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenTransferAmountIsLessThanTotalPrice()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "pending", 100000);

            try
            {
                var dto = new SepayWebhookDto
                {
                    TransferType = "in",
                    TransferAmount = 50000, // Chuyển thiếu tiền
                    Content = $"ELN{data.OrderId}"
                };

                Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);

                await act.Should().ThrowAsync<Exception>().WithMessage($"Amount mismatch. Expected: 100000, Received: 50000");
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_10]
        // [Mục đích: GetBankInfo ném lỗi nếu đơn hàng không tồn tại]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetBankInfoForOrderAsync_ShouldThrowException_WhenOrderNotFound()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            Func<Task> act = async () => await service.GetBankInfoForOrderAsync("fake-order", "fake-student");

            await act.Should().ThrowAsync<Exception>().WithMessage("Order not found or access denied.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_11]
        // [Mục đích: Không sinh Bank Info mã QR nếu hóa đơn đã được thanh toán]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetBankInfoForOrderAsync_ShouldThrowException_WhenOrderAlreadyPaid()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "paid", 100000);

            try
            {
                Func<Task> act = async () => await service.GetBankInfoForOrderAsync(data.OrderId, data.StudentId);
                await act.Should().ThrowAsync<Exception>().WithMessage("Order already paid.");
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_12]
        // [Mục đích: Sinh ra QR CODE thành công của phương thức GenerateSepayQrCode]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetBankInfoForOrderAsync_ShouldReturnBankInfo_WithValidSepayQrCode()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            
            // Set mock values for IConfiguration
            _mockConfig.Setup(c => c["Sepay:BankAccount"]).Returns("0972229142");
            _mockConfig.Setup(c => c["Sepay:BankName"]).Returns("MB");
            _mockConfig.Setup(c => c["Sepay:AccountHolder"]).Returns("TESTER");

            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "pending", 500000);

            try
            {
                var result = await service.GetBankInfoForOrderAsync(data.OrderId, data.StudentId);

                result.Should().NotBeNull();
                result.Amount.Should().Be(500000);
                result.BankAccount.Should().Be("0972229142");
                result.BankName.Should().Be("MB");
                result.AccountHolder.Should().Be("TESTER");
                result.TransferContent.Should().Be($"ELN{data.OrderId.Replace("-", "")}");
                
                // Assert generated URL format
                result.QrCodeUrl.Should().Contain("https://qr.sepay.vn/img");
                result.QrCodeUrl.Should().Contain("acc=0972229142");
                result.QrCodeUrl.Should().Contain("bank=MB");
                result.QrCodeUrl.Should().Contain("amount=500000");
                result.QrCodeUrl.Should().Contain(Uri.EscapeDataString(result.TransferContent));
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_13]
        // [Mục đích: Báo lỗi nếu Webhook gọi tới TransactionId không tồn tại trong hệ thống]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleWebhookAsync_ShouldThrowException_WhenPaymentNotFound()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var dto = new PaymentWebhookDto
            {
                TransactionId = "invalid_tx",
                Status = "success"
            };

            Func<Task> act = async () => await service.HandleWebhookAsync(dto);

            await act.Should().ThrowAsync<Exception>().WithMessage("Payment not found.");
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_14]
        // [Mục đích: Báo lỗi nếu trạng thái thanh toán từ webhook không phải là 'success']
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleWebhookAsync_ShouldThrowException_WhenStatusIsNotSuccess()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderWithPaymentAsync(dbContext, "pending");

            try
            {
                var dto = new PaymentWebhookDto
                {
                    TransactionId = data.TransactionId,
                    Status = "failed"
                };

                Func<Task> act = async () => await service.HandleWebhookAsync(dto);

                await act.Should().ThrowAsync<Exception>().WithMessage("Payment not successful.");
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_15]
        // [Mục đích: Đảm bảo tính Idempotent - Nếu Order đã trả tiền trước đó rồi thì webhook trả về true luôn]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleWebhookAsync_ShouldReturnTrueImmediately_WhenOrderIsAlreadyPaid()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderWithPaymentAsync(dbContext, "paid");

            try
            {
                var dto = new PaymentWebhookDto
                {
                    TransactionId = data.TransactionId,
                    Status = "success"
                };

                var result = await service.HandleWebhookAsync(dto);

                result.Should().BeTrue();
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_16]
        // [Mục đích: Happy path - Webhook chuẩn thì cập nhật trạng thái đơn và ngày đóng tiền]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleWebhookAsync_ShouldUpdateOrderAndPayment_HappyPath()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderWithPaymentAsync(dbContext, "pending");

            try
            {
                var dto = new PaymentWebhookDto
                {
                    TransactionId = data.TransactionId,
                    Status = "success"
                };

                var result = await service.HandleWebhookAsync(dto);

                result.Should().BeTrue();

                var order = await dbContext.Orders.FindAsync(data.OrderId);
                order.Should().NotBeNull();
                order.Status.Should().Be("paid");

                var payment = await dbContext.Payments.FindAsync(data.PaymentId);
                payment.Should().NotBeNull();
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }
        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_17]
        // [Mục đích: GetBankInfoForOrderAsync sử dụng giá trị cấu hình mặc định khi không có cấu hình]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GetBankInfoForOrderAsync_ShouldUseDefaultConfig_WhenConfigIsMissing()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            
            // Mock config returns null
            _mockConfig.Setup(c => c["Sepay:BankAccount"]).Returns((string)null);
            _mockConfig.Setup(c => c["Sepay:BankName"]).Returns((string)null);
            _mockConfig.Setup(c => c["Sepay:AccountHolder"]).Returns((string)null);

            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "pending", 500000);

            try
            {
                var result = await service.GetBankInfoForOrderAsync(data.OrderId, data.StudentId);
                result.BankAccount.Should().Be("0972229142");
                result.BankName.Should().Be("MB");
                result.AccountHolder.Should().Be("NGUYEN VAN A");
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_18]
        // [Mục đích: HandleSepayWebhookAsync sử dụng Code fallback khi Content không hợp lệ]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldUseCodeFallback_WhenContentIsInvalid()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "paid", 100000); 

            try
            {
                var dto = new SepayWebhookDto
                {
                    TransferType = "in",
                    TransferAmount = 100000,
                    Content = "INVALID CONTENT", 
                    Code = $"ELN{data.OrderId}" 
                };

                var result = await service.HandleSepayWebhookAsync(dto);
                result.Should().BeTrue(); 
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_19]
        // [Mục đích: HandleSepayWebhookAsync định dạng lại GUID 32 ký tự không dấu gạch ngang]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldFormat32CharGuid_WhenCodeHasNoDashes()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "paid", 100000); 

            try
            {
                var orderIdNoDashes = data.OrderId.Replace("-", "");
                var dto = new SepayWebhookDto
                {
                    TransferType = "in",
                    TransferAmount = 100000,
                    Content = $"ELN{orderIdNoDashes}"
                };

                var result = await service.HandleSepayWebhookAsync(dto);
                result.Should().BeTrue();
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }

        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_20]
        // [Mục đích: HandleSepayWebhookAsync ném lỗi khi cả Content và Code đều null]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldThrowException_WhenContentAndCodeAreNull()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var dto = new SepayWebhookDto
            {
                TransferType = "in",
                TransferAmount = 100000,
                Content = null,
                Code = null
            };

            Func<Task> act = async () => await service.HandleSepayWebhookAsync(dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Cannot extract OrderId from transaction. Format: ELN<orderId>");
        }
        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_21]
        // [Mục đích: GeneratePaymentQrAsync trả về PaymentQrDto khi dữ liệu hợp lệ]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task GeneratePaymentQrAsync_ShouldReturnDto_WhenValid()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(_mockPaymentRepo.Object, dbContext, _mockConfig.Object);

            var order = new Orders { Id = "order-1", StudentId = "student-1", Status = "pending" };
            var payment = new Payment { Id = "pay-1", OrderId = order.Id, Order = order, TransactionId = "txn-1", Amount = 100000 };

            _mockPaymentRepo.Setup(r => r.GetByIdAsync("pay-1")).ReturnsAsync(payment);

            var result = await service.GeneratePaymentQrAsync("pay-1", "student-1");

            result.Should().NotBeNull();
            result.PaymentId.Should().Be("pay-1");
            result.TransactionId.Should().Be("txn-1");
            result.Amount.Should().Be(100000);
            result.QrCode.Should().StartWith("data:image/png;base64,");
        }
        // ------------------------------------------------------------------------------------------------
        // [ID: SERV_PS_22]
        // [Mục đích: HandleSepayWebhookAsync định dạng lại GUID 32 ký tự lấy từ Code fallback]
        // ------------------------------------------------------------------------------------------------
        [Fact]
        public async Task HandleSepayWebhookAsync_ShouldFormat32CharGuid_WhenExtractedFromCode()
        {
            var dbContext = GetDatabaseContext();
            var paymentRepo = new PaymentRepository(dbContext);
            var service = new PaymentService(paymentRepo, dbContext, _mockConfig.Object);

            var data = await InsertDummyOrderAsync(dbContext, "paid", 100000); 

            try
            {
                var orderIdNoDashes = data.OrderId.Replace("-", "");
                var dto = new SepayWebhookDto
                {
                    TransferType = "in",
                    TransferAmount = 100000,
                    Content = "INVALID_NO_ORDERID", // Ép logic chuyển sang dùng Code fallback
                    Code = $"ELN{orderIdNoDashes}"  // Code không có dấu gạch ngang (32 chars)
                };

                var result = await service.HandleSepayWebhookAsync(dto);
                result.Should().BeTrue();
            }
            finally
            {
                await CleanupDummyOrderAsync(dbContext, data.StudentId, data.UserId);
            }
        }
    }
}
