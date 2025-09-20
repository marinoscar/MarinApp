using Microsoft.OpenApi.Models;

namespace MarinApp.Mud.Extensions
{
    public static class BuilderExtensions
    {
        public static IServiceCollection AddSwaggerWithApiKey(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
                {
                    Description = "API Key needed to access the endpoints. m-key: Your_API_Key",
                    In = ParameterLocation.Header,
                    Name = "m-key",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "ApiKeyScheme"
                });

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
