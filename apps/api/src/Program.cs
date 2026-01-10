using System.Reflection;
using System.Text;
using MarinApp.API.Options;
using MarinApp.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace MarinApp.API;

/// <summary>
/// Application entry point.
/// </summary>
public static class Program
{
    /// <summary>
    /// Application entry point.
    /// </summary>
    /// <param name="args">Command-line arguments.</param>
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddEnvironmentVariables();

        var sharedGoogleClientId = builder.Configuration["VITE_GOOGLE_CLIENT_ID"];
        if (!string.IsNullOrWhiteSpace(sharedGoogleClientId) &&
            string.IsNullOrWhiteSpace(builder.Configuration["Auth:GoogleClientId"]))
        {
            builder.Configuration["Auth:GoogleClientId"] = sharedGoogleClientId;
        }



        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
            options.SwaggerDoc("v1", new() { Title = "MarinApp API", Version = "v1" });
            options.AddSecurityDefinition("Bearer", new()
            {
                Name = "Authorization",
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                Description = "JWT Authorization header using the Bearer scheme."
            });
            options.AddSecurityRequirement(new()
            {
                {
                    new()
                    {
                        Reference = new()
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
        builder.Services.Configure<StorageOptions>(builder.Configuration.GetSection(StorageOptions.SectionName));
        builder.Services.AddSingleton<IGoogleTokenValidator, GoogleTokenValidator>();
        builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
        builder.Services.AddSingleton<IClipboardStorageService, S3ClipboardStorageService>();

        var authOptions = builder.Configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>();
        if (authOptions is null ||
            string.IsNullOrWhiteSpace(authOptions.GoogleClientId) ||
            string.IsNullOrWhiteSpace(authOptions.JwtIssuer) ||
            string.IsNullOrWhiteSpace(authOptions.JwtAudience) ||
            string.IsNullOrWhiteSpace(authOptions.JwtSigningKey))
        {
            throw new InvalidOperationException("Auth configuration is missing required values.");
        }

        var storageOptions = builder.Configuration.GetSection(StorageOptions.SectionName).Get<StorageOptions>() ?? new StorageOptions();

        storageOptions.S3BucketName = builder.Configuration["AWS_BUCKET_NAME"] ?? throw new InvalidOperationException("AWS_BUCKET_NAME configuration is missing or empty.");
        storageOptions.S3Region = builder.Configuration["AWS_REGION"] ?? throw new InvalidOperationException("AWS_REGION configuration is missing or empty.");

        // If the section was empty, populate and save it back to the configuration
        if (builder.Configuration.GetSection(StorageOptions.SectionName).Get<StorageOptions>() == null)
        {
            builder.Configuration[StorageOptions.SectionName + ":S3BucketName"] = storageOptions.S3BucketName;
            builder.Configuration[StorageOptions.SectionName + ":S3Region"] = storageOptions.S3Region;
        }


        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = authOptions.JwtIssuer,
                    ValidAudience = authOptions.JwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOptions.JwtSigningKey))
                };
            });

        builder.Services.AddAuthorization();

        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (allowedOrigins.Length == 0)
        {
            var rawOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? builder.Configuration["Cors__AllowedOrigins"];
            if (!string.IsNullOrWhiteSpace(rawOrigins))
            {
                allowedOrigins = rawOrigins
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            }
        }

        if (allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException("CORS configuration is missing allowed origins.");
        }

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(CorsOptions.PolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseCors(CorsOptions.PolicyName);
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}
