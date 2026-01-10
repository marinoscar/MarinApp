using Google.Apis.Auth;

namespace MarinApp.API.Services;

/// <summary>
/// Validates Google identity tokens.
/// </summary>
public interface IGoogleTokenValidator
{
    /// <summary>
    /// Validates the provided Google ID token.
    /// </summary>
    /// <param name="idToken">The Google ID token.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The validated payload.</returns>
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, CancellationToken cancellationToken);
}
