using System.Security.Claims;
using MarinApp.API.Dtos;
using MarinApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarinApp.API.Controllers;

/// <summary>
/// Manages the authenticated user's clipboard entries.
/// </summary>
[ApiController]
[Route("api/clipboard")]
[Authorize]
public class ClipboardController : ControllerBase
{
    private readonly IClipboardStorageService _clipboardStorageService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ClipboardController"/> class.
    /// </summary>
    /// <param name="clipboardStorageService">The clipboard storage service.</param>
    public ClipboardController(IClipboardStorageService clipboardStorageService)
    {
        _clipboardStorageService = clipboardStorageService;
    }

    /// <summary>
    /// Lists clipboard items for the authenticated user.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The clipboard items.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ClipboardListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ClipboardListResponse>> List(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var items = await _clipboardStorageService.ListAsync(userId, cancellationToken);
        return Ok(new ClipboardListResponse { Items = items });
    }

    /// <summary>
    /// Creates a text clipboard item.
    /// </summary>
    /// <param name="request">The create request.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The created item id.</returns>
    [HttpPost("text")]
    [ProducesResponseType(typeof(ClipboardTextCreateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ClipboardTextCreateResponse>> CreateText(
        [FromBody] ClipboardTextCreateRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.MarkdownContent))
        {
            return BadRequest("Markdown content is required.");
        }

        var itemId = await _clipboardStorageService.CreateTextAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(List), new ClipboardTextCreateResponse { Id = itemId });
    }

    /// <summary>
    /// Uploads a file or image to the clipboard.
    /// </summary>
    /// <param name="file">The uploaded file.</param>
    /// <param name="title">Optional title.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The created item id.</returns>
    [HttpPost("files")]
    [ProducesResponseType(typeof(ClipboardTextCreateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ClipboardTextCreateResponse>> UploadFile(
        [FromForm] IFormFile? file,
        [FromForm] string? title,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (file is null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        await using var stream = file.OpenReadStream();
        var itemId = await _clipboardStorageService.CreateFileAsync(
            userId,
            file.FileName,
            file.ContentType ?? "application/octet-stream",
            file.Length,
            stream,
            title,
            cancellationToken);

        return CreatedAtAction(nameof(List), new ClipboardTextCreateResponse { Id = itemId });
    }

    /// <summary>
    /// Deletes a clipboard item.
    /// </summary>
    /// <param name="itemId">The item identifier.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{itemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(string itemId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        await _clipboardStorageService.DeleteAsync(userId, itemId, cancellationToken);
        return NoContent();
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
