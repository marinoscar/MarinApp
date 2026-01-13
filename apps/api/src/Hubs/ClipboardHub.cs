using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MarinApp.API.Hubs;

/// <summary>
/// SignalR hub for clipboard updates.
/// </summary>
[Authorize]
public sealed class ClipboardHub : Hub
{
    /// <summary>
    /// Gets the hub route for clipboard updates.
    /// </summary>
    public const string HubRoute = "/hubs/clipboard";

    /// <inheritdoc />
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetUserGroup(userId));
        }

        await base.OnConnectedAsync();
    }

    /// <inheritdoc />
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetUserGroup(userId));
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Gets the SignalR group name for a user.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <returns>The group name.</returns>
    public static string GetUserGroup(string userId) => userId;
}
