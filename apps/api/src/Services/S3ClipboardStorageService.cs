using System.Net.Mime;
using System.Text.Json;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using MarinApp.API.Dtos;
using MarinApp.API.Options;
using Microsoft.Extensions.Options;

namespace MarinApp.API.Services;

/// <summary>
/// Stores clipboard data in Amazon S3.
/// </summary>
public sealed class S3ClipboardStorageService : IClipboardStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly StorageOptions _options;
    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="S3ClipboardStorageService"/> class.
    /// </summary>
    /// <param name="options">The storage options.</param>
    public S3ClipboardStorageService(IOptions<StorageOptions> options)
    {
        _options = options.Value;
        _s3Client = new AmazonS3Client(new AmazonS3Config
        {
            RegionEndpoint = RegionEndpoint.GetBySystemName(_options.S3Region)
        });
    }

    /// <inheritdoc />
    public async Task<IReadOnlyCollection<ClipboardItemDto>> ListAsync(string userId, CancellationToken cancellationToken)
    {
        await EnsureBucketExistsAsync(cancellationToken);

        var prefix = GetUserPrefix(userId);
        var items = new List<ClipboardItemDto>();
        string? continuationToken = null;

        do
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _options.S3BucketName,
                Prefix = prefix,
                ContinuationToken = continuationToken
            };

            var response = await _s3Client.ListObjectsV2Async(request, cancellationToken);
            continuationToken = response.IsTruncated ? response.NextContinuationToken : null;

            foreach (var s3Object in response.S3Objects)
            {
                if (!s3Object.Key.EndsWith("/metadata.json", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var metadata = await GetMetadataAsync(s3Object.Key, cancellationToken);
                if (metadata is null)
                {
                    continue;
                }

                var dto = new ClipboardItemDto
                {
                    Id = metadata.Id,
                    ItemType = metadata.ItemType,
                    Title = metadata.Title,
                    MarkdownContent = metadata.MarkdownContent,
                    FileName = metadata.FileName,
                    ContentType = metadata.ContentType,
                    FileSizeBytes = metadata.FileSizeBytes,
                    CreatedAt = metadata.CreatedAt,
                    PreviewUrl = metadata.FileKey is null
                        ? null
                        : _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
                        {
                            BucketName = _options.S3BucketName,
                            Key = metadata.FileKey,
                            Expires = DateTime.UtcNow.AddMinutes(15)
                        })
                };

                items.Add(dto);
            }
        } while (!string.IsNullOrWhiteSpace(continuationToken));

        return items.OrderByDescending(item => item.CreatedAt).ToArray();
    }

    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await _s3Client.ListBucketsAsync(cancellationToken);
            if (!response.Buckets.Any(b => b.BucketName == _options.S3BucketName))
            {
                await _s3Client.PutBucketAsync(new PutBucketRequest
                {
                    BucketName = _options.S3BucketName,
                    UseClientRegion = true
                }, cancellationToken);
            }
        }
        catch (AmazonS3Exception ex) when (ex.ErrorCode == "BucketAlreadyOwnedByYou")
        {
            // Bucket already exists and is owned by the user, no action needed.
        }
    }

    /// <inheritdoc />
    public async Task<string> CreateTextAsync(string userId, ClipboardTextCreateRequest request, CancellationToken cancellationToken)
    {
        var itemId = Guid.NewGuid().ToString("N");
        var baseKey = GetItemPrefix(userId, itemId);
        var contentKey = $"{baseKey}/content.md";
        var metadataKey = $"{baseKey}/metadata.json";

        var contentRequest = new PutObjectRequest
        {
            BucketName = _options.S3BucketName,
            Key = contentKey,
            ContentType = "text/markdown",
            ContentBody = request.MarkdownContent.Trim()
        };
        contentRequest.Metadata.Add("user-id", userId);
        contentRequest.Metadata.Add("item-type", "text");

        await _s3Client.PutObjectAsync(contentRequest, cancellationToken);

        var metadata = new ClipboardMetadata
        {
            Id = itemId,
            ItemType = "text",
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title,
            MarkdownContent = request.MarkdownContent.Trim(),
            ContentType = "text/markdown",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await PutMetadataAsync(metadataKey, userId, metadata, cancellationToken);

        return itemId;
    }

    /// <inheritdoc />
    public async Task<string> CreateFileAsync(
        string userId,
        string fileName,
        string contentType,
        long contentLength,
        Stream content,
        string? title,
        CancellationToken cancellationToken)
    {
        var itemId = Guid.NewGuid().ToString("N");
        var baseKey = GetItemPrefix(userId, itemId);
        var fileKey = $"{baseKey}/content";
        var metadataKey = $"{baseKey}/metadata.json";

        var putRequest = new PutObjectRequest
        {
            BucketName = _options.S3BucketName,
            Key = fileKey,
            InputStream = content,
            ContentType = contentType
        };
        putRequest.Metadata.Add("user-id", userId);
        putRequest.Metadata.Add("item-type", "file");
        putRequest.Metadata.Add("original-file-name", fileName);

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);

        var metadata = new ClipboardMetadata
        {
            Id = itemId,
            ItemType = "file",
            Title = string.IsNullOrWhiteSpace(title) ? null : title,
            FileKey = fileKey,
            FileName = fileName,
            ContentType = contentType,
            FileSizeBytes = contentLength,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await PutMetadataAsync(metadataKey, userId, metadata, cancellationToken);

        return itemId;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string userId, string itemId, CancellationToken cancellationToken)
    {
        var prefix = GetItemPrefix(userId, itemId);
        string? continuationToken = null;

        do
        {
            var listRequest = new ListObjectsV2Request
            {
                BucketName = _options.S3BucketName,
                Prefix = prefix,
                ContinuationToken = continuationToken
            };

            var listResponse = await _s3Client.ListObjectsV2Async(listRequest, cancellationToken);
            continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : null;

            if (listResponse.S3Objects.Count == 0)
            {
                continue;
            }

            var deleteRequest = new DeleteObjectsRequest
            {
                BucketName = _options.S3BucketName,
                Objects = listResponse.S3Objects.Select(obj => new KeyVersion { Key = obj.Key }).ToList()
            };

            await _s3Client.DeleteObjectsAsync(deleteRequest, cancellationToken);
        } while (!string.IsNullOrWhiteSpace(continuationToken));
    }

    private async Task<ClipboardMetadata?> GetMetadataAsync(string key, CancellationToken cancellationToken)
    {
        var response = await _s3Client.GetObjectAsync(_options.S3BucketName, key, cancellationToken);
        await using var responseStream = response.ResponseStream;
        var metadata = await JsonSerializer.DeserializeAsync<ClipboardMetadata>(responseStream, _serializerOptions, cancellationToken);
        return metadata;
    }

    private async Task PutMetadataAsync(string metadataKey, string userId, ClipboardMetadata metadata, CancellationToken cancellationToken)
    {
        var metadataContent = JsonSerializer.Serialize(metadata, _serializerOptions);
        var request = new PutObjectRequest
        {
            BucketName = _options.S3BucketName,
            Key = metadataKey,
            ContentType = MediaTypeNames.Application.Json,
            ContentBody = metadataContent
        };
        request.Metadata.Add("user-id", userId);
        request.Metadata.Add("item-type", metadata.ItemType);
        request.Metadata.Add("created-at", metadata.CreatedAt.ToString("O"));
        if (!string.IsNullOrWhiteSpace(metadata.Title))
        {
            request.Metadata.Add("title", metadata.Title);
        }

        await _s3Client.PutObjectAsync(request, cancellationToken);
    }

    private string GetUserPrefix(string userId)
    {
        return $"{_options.S3Prefix.TrimEnd('/')}/{userId}/";
    }

    private string GetItemPrefix(string userId, string itemId)
    {
        return $"{_options.S3Prefix.TrimEnd('/')}/{userId}/{itemId}";
    }

    private sealed class ClipboardMetadata
    {
        public string Id { get; set; } = string.Empty;

        public string ItemType { get; set; } = string.Empty;

        public string? Title { get; set; }

        public string? MarkdownContent { get; set; }

        public string? FileKey { get; set; }

        public string? FileName { get; set; }

        public string? ContentType { get; set; }

        public long? FileSizeBytes { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
    }
}
