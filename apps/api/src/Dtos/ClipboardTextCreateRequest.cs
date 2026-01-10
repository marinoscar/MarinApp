namespace MarinApp.API.Dtos;

/// <summary>
/// Represents a request to create a text clipboard entry.
/// </summary>
public sealed class ClipboardTextCreateRequest
{
    /// <summary>
    /// Gets or sets the optional title for the entry.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the Markdown content.
    /// </summary>
    public string MarkdownContent { get; set; } = string.Empty;
}
