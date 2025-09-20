using MarinApp.Mud.Components;
using MarinApp.Mud.Extensions;
using MudBlazor.Services;

namespace MarinApp.Mud
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            // Add MudBlazor services
            builder.Services.AddMudServices();

            // Add Swagger
            builder.Services.AddEndpointsApiExplorer(); 
            builder.Services.AddSwaggerGen();

            // Add Swagger with API key header support
            builder.Services.AddSwaggerWithApiKey();


            // Add services to the container.
            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents();

            var app = builder.Build();

            // Map controllers
            app.MapControllers();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            // Enable middleware to serve generated Swagger as a JSON endpoint and the Swagger UI.
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseAntiforgery();

            app.MapStaticAssets();
            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            app.Run();
        }
    }
}
