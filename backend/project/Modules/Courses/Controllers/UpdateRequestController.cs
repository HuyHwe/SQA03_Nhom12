using Microsoft.AspNetCore.Mvc;

[Route("api/requestUpdateds")]
[ApiController]
public class UpdateRequestController : ControllerBase
{
    private readonly IRequestUpdateService _requestUpdateService;

    public UpdateRequestController(IRequestUpdateService requestUpdateService)
    {
        _requestUpdateService = requestUpdateService;
    }

}