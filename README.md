# MarinApp

MarinApp is a monorepo that hosts a React + TypeScript frontend and an ASP.NET Core WebAPI backend. The MVP focuses on Google OAuth sign-in, JWT-based API access, and a clean foundation for future features.

## Repository Structure
- `apps/api` — ASP.NET Core WebAPI
- `apps/web` — React + TypeScript SPA (MUI)
- `docs/` — architecture and design documentation

## Prerequisites
- .NET SDK 9.0+
- Node.js 20+
- A Google OAuth client ID (for the frontend and backend)

## Environment Variables
All configuration is provided via environment variables. Copy `.env.example` and export the values in your shell or via your process manager.

### Shared
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID (used by both API and web)

### API (`apps/api`)
- `Auth__JwtIssuer` — JWT issuer (e.g., `http://localhost:5143`)
- `Auth__JwtAudience` — JWT audience (e.g., `marinapp-web`)
- `Auth__JwtSigningKey` — JWT signing key (use a strong secret)
- `Auth__JwtExpirationMinutes` — JWT lifetime in minutes
- `Cors__AllowedOrigins` — comma-separated list of allowed frontend origins (e.g., `http://localhost:5173`)
- `ConnectionStrings__Default` — PostgreSQL connection string for the cloud database
- `Storage__S3BucketName` — S3 bucket for clipboard entries
- `Storage__S3Region` — AWS region for the S3 bucket (e.g., `us-east-1`)
- `Storage__S3Prefix` — optional prefix for clipboard objects (defaults to `clipboard`)
- Standard AWS credential environment variables such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (if applicable), and `AWS_REGION` are required when running locally.

### Web (`apps/web`)
- `VITE_API_BASE_URL` — API base URL (e.g., `http://localhost:5143`)


## Running Locally

### 1) Run the API
```bash
cd apps/api/src/MarinApp.API
dotnet restore
dotnet run
```
The API will be available at `http://localhost:5143` (see output for the exact port).

### 2) Run the Web App
```bash
cd apps/web
npm install
npm run dev
```
The web app will be available at `http://localhost:5173`.

## API Endpoints
- `POST /api/auth/google` — Exchange a Google ID token for a JWT access token.
- `GET /api/profile/me` — Returns the authenticated user's profile.
- `GET /api/health` — Health check.
- `GET /api/clipboard` — List clipboard items for the authenticated user.
- `POST /api/clipboard/text` — Create a Markdown text clipboard item.
- `POST /api/clipboard/files` — Upload a file or image to the clipboard.
- `DELETE /api/clipboard/{itemId}` — Delete a clipboard item.

## Documentation
- `docs/architecture.md` — System architecture, auth flow, and trust boundaries.

## Notes
- The frontend stores the API JWT in `sessionStorage` and sends it as a Bearer token on every API request.
- Do not commit secrets to the repository.
