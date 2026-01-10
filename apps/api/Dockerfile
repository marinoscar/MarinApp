FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src
COPY apps/api/src/MarinApp.API.sln ./MarinApp.API.sln
COPY apps/api/src/MarinApp.API.csproj ./MarinApp.API.csproj
RUN dotnet restore ./MarinApp.API.sln

COPY apps/api/src/ ./
RUN dotnet publish ./MarinApp.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "MarinApp.API.dll"]
