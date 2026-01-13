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

## Configuration
Copy the versioned example JSON files to their runtime counterparts:

- `apps/api/src/config.example.json` → `apps/api/src/config.json`
- `apps/web/public/config.example.json` → `apps/web/public/config.json`

The web app can also load config from `apps/web/public/config.js` if you prefer runtime injection without an extra fetch:

- `apps/web/public/config.example.js` → `apps/web/public/config.js`

These config files hold non-secret configuration such as Google OAuth client IDs, CORS origins, and base URLs.

The API reads `Auth:JwtExpirationMinutes` from `apps/api/src/config.json` to control how long access tokens remain valid (default: 43200 minutes / 30 days).

### Environment Variables (secrets + AWS)
Copy `apps/web/.env.example` and export the values in your shell or via your process manager.

- `Auth__JwtSigningKey` — JWT signing key (use a strong secret)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (if applicable) — AWS credentials
- `AWS_REGION` — AWS region for the S3 bucket (e.g., `us-east-1`)
- `AWS_BUCKET_NAME` — S3 bucket for clipboard entries


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
- `GET /hubs/clipboard` — SignalR hub that streams clipboard updates to connected clients.

## Documentation
- `docs/architecture.md` — System architecture, auth flow, and trust boundaries.

## Notes
- The frontend stores the API JWT in `localStorage` and sends it as a Bearer token on every API request to preserve sessions across restarts.
- When a protected route is accessed without a valid session, the app redirects to sign-in and returns to the originating route after authentication.
- Do not commit secrets to the repository.
