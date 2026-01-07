using System.Security.Claims;

namespace MarinApp.API.Services;

/// <summary>
/// Creates JWT access tokens.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Creates a JWT access token for the specified claims.
    /// </summary>
    /// <param name="claims">The claims to include.</param>
    /// <returns>The access token and its expiration in seconds.</returns>
    (string Token, int ExpiresInSeconds) CreateAccessToken(IEnumerable<Claim> claims);
}
