namespace MarinApp.API.Options;

/// <summary>
/// CORS configuration options loaded from environment variables.
/// </summary>
public class CorsOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Cors";

    /// <summary>
    /// The CORS policy name.
    /// </summary>
    public const string PolicyName = "DefaultCorsPolicy";

    /// <summary>
    /// Gets or sets the allowed origins for CORS.
    /// </summary>
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}
