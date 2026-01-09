namespace MarinApp.API.Options;

/// <summary>
/// Configuration options for object storage.
/// </summary>
public sealed class StorageOptions
{
    /// <summary>
    /// Configuration section name.
    /// </summary>
    public const string SectionName = "Storage";

    /// <summary>
    /// Gets or sets the S3 bucket name for clipboard data.
    /// </summary>
    public string S3BucketName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the AWS region for the S3 bucket.
    /// </summary>
    public string S3Region { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the object key prefix for clipboard entries.
    /// </summary>
    public string S3Prefix { get; set; } = "clipboard";
}
