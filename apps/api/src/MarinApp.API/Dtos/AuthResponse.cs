namespace MarinApp.API.Dtos;

/// <summary>
/// Response payload for issuing an API access token.
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// Gets or sets the access token.
    /// </summary>
    public required string AccessToken { get; set; }

    /// <summary>
    /// Gets or sets the token type.
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Gets or sets the number of seconds before the token expires.
    /// </summary>
    public int ExpiresInSeconds { get; set; }
}
