using Google.Apis.Auth;
using MarinApp.API.Options;
using Microsoft.Extensions.Options;

namespace MarinApp.API.Services;

/// <summary>
/// Validates Google ID tokens against the configured client identifier.
/// </summary>
public class GoogleTokenValidator : IGoogleTokenValidator
{
    private readonly AuthOptions _authOptions;

    /// <summary>
    /// Initializes a new instance of the <see cref="GoogleTokenValidator"/> class.
    /// </summary>
    /// <param name="authOptions">The authentication options.</param>
    public GoogleTokenValidator(IOptions<AuthOptions> authOptions)
    {
        _authOptions = authOptions.Value ?? throw new InvalidOperationException("Auth configuration is missing.");
    }

    /// <inheritdoc />
    public Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new ArgumentException("Google ID token is required.", nameof(idToken));
        }

        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _authOptions.GoogleClientId }
        };

        return GoogleJsonWebSignature.ValidateAsync(idToken, settings, cancellationToken);
    }
}
