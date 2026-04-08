public interface IUserService
{
    Task<bool> IsUserExistAsync(string userId);
}