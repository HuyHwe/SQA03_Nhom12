using Microsoft.EntityFrameworkCore;

namespace project.Tests.Modules.Exams
{
    /// <summary>
    /// Helper dùng chung cho test module Exams.
    /// - Tạo DB in-memory theo tên riêng để mỗi test độc lập dữ liệu.
    /// - Cung cấp hàm rollback theo đúng yêu cầu: dọn sạch DB sau test.
    /// </summary>
    public static class ExamsTestDbFactory
    {
        public static DBContext CreateInMemoryDbContext(string? databaseName = null)
        {
            var options = new DbContextOptionsBuilder<DBContext>()
                .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString("N"))
                .Options;

            return new DBContext(options);
        }

        public static async Task RollbackAsync(DBContext dbContext)
        {
            // Rollback ở mức test DB: xóa toàn bộ DB in-memory để trạng thái trở về như trước test.
            await dbContext.Database.EnsureDeletedAsync();
        }
    }
}

