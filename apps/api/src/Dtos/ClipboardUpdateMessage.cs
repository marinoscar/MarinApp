namespace MarinApp.API.Dtos;

/// <summary>
/// Represents a clipboard update broadcast to connected clients.
/// </summary>
public sealed class ClipboardUpdateMessage
{
    /// <summary>
    /// Gets or sets the clipboard item identifier.
    /// </summary>
    public string ItemId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the update type (for example, created).
    /// </summary>
    public string UpdateType { get; set; } = "created";

    /// <summary>
    /// Gets or sets the timestamp of the update.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}
