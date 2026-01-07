namespace MarinApp.API.Dtos;

/// <summary>
/// Response payload for health checks.
/// </summary>
public class HealthResponse
{
    /// <summary>
    /// Gets or sets the current status.
    /// </summary>
    public required string Status { get; set; }

    /// <summary>
    /// Gets or sets the UTC timestamp for the response.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }
}
