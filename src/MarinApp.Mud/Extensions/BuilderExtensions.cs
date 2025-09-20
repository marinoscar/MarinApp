using Microsoft.OpenApi.Models;

namespace MarinApp.Mud.Extensions
{
    /// <summary>
    /// Provides extension methods for configuring services in the application builder.
    /// </summary>
    public static class BuilderExtensions
    {
        /// <summary>
        /// Adds Swagger generation and configures API key authentication for the API documentation.
        /// <para>
        /// This method registers the Swagger generator and sets up an API key security definition.
        /// The API key is expected to be provided in the request header named <c>m-key</c>.
        /// </para>
        /// <example>
        /// <code>
        /// services.AddSwaggerWithApiKey();
        /// </code>
        /// </example>
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> to add the Swagger services to.</param>
        /// <returns>The updated <see cref="IServiceCollection"/> with Swagger and API key security configured.</returns>
        public static IServiceCollection AddSwaggerWithApiKey(this IServiceCollection services)
        {
            // Registers the endpoint API explorer for Swagger.
            services.AddEndpointsApiExplorer();

            // Configures Swagger generation with API key security.
            services.AddSwaggerGen(options =>
            {
                // Adds a security definition for API key authentication.
                options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
                {
                    Description = "API Key needed to access the endpoints. m-key: Your_API_Key",
                    In = ParameterLocation.Header,
                    Name = "m-key",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "ApiKeyScheme"
                });

                // Adds a security requirement referencing the API key definition.
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "ApiKey"
                                }
                            },
                            new List<string>()
                        }
                });
            });

            return services;
        }
    }
}
