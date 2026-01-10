using MarinApp.API.Dtos;

namespace MarinApp.API.Services;

/// <summary>
/// In-memory clipboard storage used for local development.
/// </summary>
public sealed class InMemoryClipboardStorageService : IClipboardStorageService
{
    private readonly Dictionary<string, List<ClipboardItemDto>> _items = new();

    /// <inheritdoc />
    public Task<IReadOnlyCollection<ClipboardItemDto>> ListAsync(string userId, CancellationToken cancellationToken)
    {
        if (_items.TryGetValue(userId, out var items))
        {
            var ordered = items.OrderByDescending(item => item.CreatedAt).ToArray();
            return Task.FromResult<IReadOnlyCollection<ClipboardItemDto>>(ordered);
        }

        return Task.FromResult<IReadOnlyCollection<ClipboardItemDto>>(Array.Empty<ClipboardItemDto>());
    }

    /// <inheritdoc />
    public Task<string> CreateTextAsync(string userId, ClipboardTextCreateRequest request, CancellationToken cancellationToken)
    {
        var item = new ClipboardItemDto
        {
            Id = Guid.NewGuid().ToString("N"),
            ItemType = "text",
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title,
            MarkdownContent = request.MarkdownContent.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        if (!_items.TryGetValue(userId, out var items))
        {
            items = new List<ClipboardItemDto>();
            _items[userId] = items;
        }

        items.Add(item);

        return Task.FromResult(item.Id);
    }

    /// <inheritdoc />
    public Task DeleteAsync(string userId, string itemId, CancellationToken cancellationToken)
    {
        if (_items.TryGetValue(userId, out var items))
        {
            items.RemoveAll(item => string.Equals(item.Id, itemId, StringComparison.OrdinalIgnoreCase));
        }

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<string> CreateFileAsync(
        string userId,
        string fileName,
        string contentType,
        long contentLength,
        Stream content,
        string? title,
        CancellationToken cancellationToken)
    {
        var item = new ClipboardItemDto
        {
            Id = Guid.NewGuid().ToString("N"),
            ItemType = "file",
            Title = string.IsNullOrWhiteSpace(title) ? null : title,
            FileName = fileName,
            ContentType = contentType,
            FileSizeBytes = contentLength,
            CreatedAt = DateTimeOffset.UtcNow
        };

        if (!_items.TryGetValue(userId, out var items))
        {
            items = new List<ClipboardItemDto>();
            _items[userId] = items;
        }

        items.Add(item);

        return Task.FromResult(item.Id);
    }
}
