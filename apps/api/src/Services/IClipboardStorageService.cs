using MarinApp.API.Dtos;

namespace MarinApp.API.Services;

/// <summary>
/// Provides access to clipboard storage.
/// </summary>
public interface IClipboardStorageService
{
    /// <summary>
    /// Lists clipboard items for a user.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The clipboard items.</returns>
    Task<IReadOnlyCollection<ClipboardItemDto>> ListAsync(string userId, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a text clipboard item.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="request">The create request.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The created item id.</returns>
    Task<string> CreateTextAsync(string userId, ClipboardTextCreateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a clipboard item.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="itemId">The item identifier.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    Task DeleteAsync(string userId, string itemId, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a file clipboard item.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="fileName">The file name.</param>
    /// <param name="contentType">The content type.</param>
    /// <param name="contentLength">The content length.</param>
    /// <param name="content">The file content stream.</param>
    /// <param name="title">An optional title.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The created item id.</returns>
    Task<string> CreateFileAsync(
        string userId,
        string fileName,
        string contentType,
        long contentLength,
        Stream content,
        string? title,
        CancellationToken cancellationToken);
}
