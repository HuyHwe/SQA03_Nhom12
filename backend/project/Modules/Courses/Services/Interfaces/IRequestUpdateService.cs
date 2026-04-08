public interface IRequestUpdateService
{
    Task CreateRequestUpdateAsync(string userId, RequestUpdateRequestDTO requestDto);
}