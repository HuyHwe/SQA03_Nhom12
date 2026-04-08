public class RequestUpdateRepository : IRequestUpdateRepository
{
    private readonly DBContext _dbContext;
    public RequestUpdateRepository(DBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateRequestUpdateRequestAsync(UpdateRequestCourse requestUpdate)
    {
        await _dbContext.UpdateRequestCourses.AddAsync(requestUpdate);
        await _dbContext.SaveChangesAsync();
    }
}