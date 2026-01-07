using MarinApp.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarinApp.API.Controllers;

/// <summary>
/// Health check endpoints.
/// </summary>
[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Returns the API health status.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The health response.</returns>
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public Task<ActionResult<HealthResponse>> Get(CancellationToken cancellationToken)
    {
        var response = new HealthResponse
        {
            Status = "ok",
            Timestamp = DateTimeOffset.UtcNow
        };

        return Task.FromResult<ActionResult<HealthResponse>>(Ok(response));
    }
}
