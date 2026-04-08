public class APIResponse
{
    public string Status { get; set; }
    public string Message { get; set; } = null!;
    public object? Data { get; set; } = default!;

    public APIResponse(string status, string message, object? data = null)
    {
        Status = status;
        Message = message;
        Data = data;
    }
}