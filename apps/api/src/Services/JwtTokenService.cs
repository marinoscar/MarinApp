using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MarinApp.API.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace MarinApp.API.Services;

/// <summary>
/// Creates signed JWT access tokens.
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly AuthOptions _authOptions;

    /// <summary>
    /// Initializes a new instance of the <see cref="JwtTokenService"/> class.
    /// </summary>
    /// <param name="authOptions">Authentication configuration options.</param>
    public JwtTokenService(IOptions<AuthOptions> authOptions)
    {
        _authOptions = authOptions.Value ?? throw new InvalidOperationException("Auth configuration is missing.");
    }

    /// <inheritdoc />
    public (string Token, int ExpiresInSeconds) CreateAccessToken(IEnumerable<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_authOptions.JwtSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTimeOffset.UtcNow.AddMinutes(_authOptions.JwtExpirationMinutes);

        var token = new JwtSecurityToken(
            issuer: _authOptions.JwtIssuer,
            audience: _authOptions.JwtAudience,
            claims: claims,
            expires: expires.UtcDateTime,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), (int)(expires - DateTimeOffset.UtcNow).TotalSeconds);
    }
}
