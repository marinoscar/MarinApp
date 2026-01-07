namespace MarinApp.API.Dtos;

/// <summary>
/// Request payload for exchanging a Google ID token for an API token.
/// </summary>
public class AuthGoogleRequest
{
    /// <summary>
    /// Gets or sets the Google ID token.
    /// </summary>
    public required string IdToken { get; set; }
}
