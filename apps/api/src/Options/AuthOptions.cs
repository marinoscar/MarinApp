namespace MarinApp.API.Options;

/// <summary>
/// Authentication configuration options loaded from environment variables.
/// </summary>
public class AuthOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Auth";

    /// <summary>
    /// Gets or sets the Google OAuth client identifier.
    /// </summary>
    public required string GoogleClientId { get; set; }

    /// <summary>
    /// Gets or sets the JWT issuer.
    /// </summary>
    public required string JwtIssuer { get; set; }

    /// <summary>
    /// Gets or sets the JWT audience.
    /// </summary>
    public required string JwtAudience { get; set; }

    /// <summary>
    /// Gets or sets the JWT signing key.
    /// </summary>
    public required string JwtSigningKey { get; set; }

    /// <summary>
    /// Gets or sets the JWT expiration window in minutes.
    /// </summary>
    public int JwtExpirationMinutes { get; set; } = 60;
}
