using System.Security.Claims;
using MarinApp.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarinApp.API.Controllers;

/// <summary>
/// Endpoints for the authenticated user's profile.
/// </summary>
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    /// <summary>
    /// Returns the authenticated user's profile data.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The profile response.</returns>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public Task<ActionResult<ProfileResponse>> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult<ActionResult<ProfileResponse>>(Unauthorized());
        }

        var response = new ProfileResponse
        {
            UserId = userId,
            Name = User.FindFirstValue(ClaimTypes.Name),
            Email = User.FindFirstValue(ClaimTypes.Email),
            PictureUrl = User.FindFirstValue("picture")
        };

        return Task.FromResult<ActionResult<ProfileResponse>>(Ok(response));
    }
}
