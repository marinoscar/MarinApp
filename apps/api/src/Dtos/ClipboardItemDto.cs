namespace MarinApp.API.Dtos;

/// <summary>
/// Represents a clipboard item returned to the client.
/// </summary>
public sealed class ClipboardItemDto
{
    /// <summary>
    /// Gets or sets the item identifier.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the clipboard item type.
    /// </summary>
    public string ItemType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the item title.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the Markdown content for text items.
    /// </summary>
    public string? MarkdownContent { get; set; }

    /// <summary>
    /// Gets or sets the file name for uploaded files.
    /// </summary>
    public string? FileName { get; set; }

    /// <summary>
    /// Gets or sets the content type for uploaded files.
    /// </summary>
    public string? ContentType { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long? FileSizeBytes { get; set; }

    /// <summary>
    /// Gets or sets a public preview URL, if available.
    /// </summary>
    public string? PreviewUrl { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp in UTC.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
