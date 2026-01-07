namespace MarinApp.API.Dtos;

/// <summary>
/// Response payload for the authenticated user's profile.
/// </summary>
public class ProfileResponse
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's display name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the user's profile picture URL.
    /// </summary>
    public string? PictureUrl { get; set; }
}
