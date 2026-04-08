public interface IUserRepository
{
    Task<bool> IsUserExistAsync(string userId);
    Task<bool> IsUserExistByEmailAsync(string email);
    Task<string> GetUserNameAsync(string userId);
}