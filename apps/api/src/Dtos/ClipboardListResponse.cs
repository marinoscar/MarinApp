namespace MarinApp.API.Dtos;

/// <summary>
/// Represents the response for listing clipboard items.
/// </summary>
public sealed class ClipboardListResponse
{
    /// <summary>
    /// Gets or sets the clipboard items.
    /// </summary>
    public IReadOnlyCollection<ClipboardItemDto> Items { get; set; } = Array.Empty<ClipboardItemDto>();
}
