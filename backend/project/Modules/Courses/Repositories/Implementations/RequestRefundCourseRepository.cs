public class RequestRefundCourseRepository : IRequestRefundCourseRepository
{
    private readonly DBContext _dbContext;
    public RequestRefundCourseRepository(DBContext dBContext)
    {
        _dbContext = dBContext;
    }

    public async Task CreateRequestRefundCourseAsync(RefundRequestCourse refundRequestCourse)
    {
        await _dbContext.RefundRequestCourses.AddAsync(refundRequestCourse);
        await _dbContext.SaveChangesAsync();
    }
}