using System.Security.Claims;
using MarinApp.API.Dtos;
using MarinApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarinApp.API.Controllers;

/// <summary>
/// Authentication endpoints for exchanging external identity tokens.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IGoogleTokenValidator _googleTokenValidator;
    private readonly IJwtTokenService _jwtTokenService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class.
    /// </summary>
    /// <param name="googleTokenValidator">Google token validator.</param>
    /// <param name="jwtTokenService">JWT token service.</param>
    public AuthController(IGoogleTokenValidator googleTokenValidator, IJwtTokenService jwtTokenService)
    {
        _googleTokenValidator = googleTokenValidator;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Exchanges a Google ID token for an API access token.
    /// </summary>
    /// <param name="request">The request payload containing the Google ID token.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>An API access token.</returns>
    [AllowAnonymous]
    [HttpPost("google")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> ExchangeGoogleToken(
        [FromBody] AuthGoogleRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Unauthorized();
        }

        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await _googleTokenValidator.ValidateAsync(request.IdToken, cancellationToken);
        }
        catch (Exception)
        {
            return Unauthorized();
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, payload.Subject),
            new(ClaimTypes.Name, payload.Name ?? payload.Email ?? string.Empty),
            new(ClaimTypes.Email, payload.Email ?? string.Empty)
        };

        if (!string.IsNullOrWhiteSpace(payload.Picture))
        {
            claims.Add(new Claim("picture", payload.Picture));
        }

        var (token, expiresInSeconds) = _jwtTokenService.CreateAccessToken(claims);

        return Ok(new AuthResponse
        {
            AccessToken = token,
            ExpiresInSeconds = expiresInSeconds
        });
    }
}
