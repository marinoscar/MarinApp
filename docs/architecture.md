# MarinApp Architecture

## System Overview
MarinApp is a monorepo with a React + TypeScript frontend and an ASP.NET Core WebAPI backend. The frontend is responsible for presentation and user interaction only. All authentication, authorization, validation, and data access live in the backend API.

**Components**
- **Frontend (`apps/web`)**: React + TypeScript SPA using Material UI (MUI) with a dark theme by default.
- **Backend (`apps/api`)**: ASP.NET Core WebAPI secured with JWT bearer authentication.
- **Persistence (planned)**: Cloud-hosted PostgreSQL for structured data and object storage (e.g., S3) for binary data. The backend will own all credentials.

## Authentication & Token Flow
MarinApp uses Google OAuth for user identity, but the API issues its own JWTs.

1. User signs in with Google on the frontend.
2. The frontend sends the Google ID token to `POST /api/auth/google`.
3. The backend validates the Google token and issues a short-lived JWT access token.
4. The frontend stores the API JWT in **sessionStorage** and attaches it to all API requests in the `Authorization: Bearer <token>` header.
5. The backend validates JWTs for all protected endpoints.

### Token Storage Strategy
- **Storage**: `sessionStorage`
- **Rationale**: keeps the token scoped to the browser session and avoids persistence across restarts. This is still susceptible to XSS; therefore UI code must avoid unsafe HTML injection and third-party scripts.

## Trust Boundaries
- The **frontend is untrusted** and must never access databases or storage directly.
- All authorization checks happen in the **backend**.
- Only the backend stores or accesses credentials for external services (Google OAuth, cloud PostgreSQL, object storage).

## API Surface (Initial)
- `POST /api/auth/google`: Exchanges a Google ID token for an API JWT.
- `GET /api/profile/me`: Returns the authenticated user profile from JWT claims.
- `GET /api/health`: Basic health check.
- `GET /api/clipboard`: Lists clipboard items for the authenticated user.
- `POST /api/clipboard/text`: Stores Markdown text in the user's clipboard.
- `POST /api/clipboard/files`: Stores a file or image in the user's clipboard.
- `DELETE /api/clipboard/{itemId}`: Deletes a clipboard item.

## Security Controls
- JWT validation enforces issuer, audience, signature, and expiration.
- CORS is locked down to configured frontend origins.
- Secrets are provided **only via environment variables**.

## Clipboard Storage Design
Clipboard items are persisted in Amazon S3 per user. For each clipboard item, the API writes:

- `metadata.json`: JSON metadata containing item id, type, title, timestamps, and file/text details.
- `content.md` for Markdown text entries.
- `content` for file/image uploads.

S3 object metadata includes `user-id`, `item-type`, `created-at`, and optional titles to simplify audit and debugging. The API enforces per-user access to clipboard objects and returns short-lived presigned URLs for previews.

## Configuration
Environment variables are used for all secrets and environment-specific values, including the cloud PostgreSQL connection string. The Google OAuth client ID is shared between the API and web via the `VITE_GOOGLE_CLIENT_ID` environment variable. See `README.md` for the full list.
