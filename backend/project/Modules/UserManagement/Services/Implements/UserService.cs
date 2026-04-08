public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> IsUserExistAsync(string userId)
    {
        var userIdGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));
        return await _userRepository.IsUserExistAsync(userId);
    }
}