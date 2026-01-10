namespace MarinApp.API.Dtos;

/// <summary>
/// Represents the response for creating a text clipboard item.
/// </summary>
public sealed class ClipboardTextCreateResponse
{
    /// <summary>
    /// Gets or sets the created item id.
    /// </summary>
    public string Id { get; set; } = string.Empty;
}
