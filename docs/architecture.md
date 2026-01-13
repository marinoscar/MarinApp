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
4. The frontend stores the API JWT in **localStorage** and attaches it to all API requests in the `Authorization: Bearer <token>` header.
5. The backend validates JWTs for all protected endpoints.

### Token Storage Strategy
- **Storage**: `localStorage`
- **Rationale**: persists the token across restarts to provide a long-lived session. This is still susceptible to XSS; therefore UI code must avoid unsafe HTML injection and third-party scripts.

### Session Expiration Handling
- Any request that returns `401 Unauthorized` clears the session client-side.
- When navigating to protected routes without a valid session, the frontend redirects to the sign-in view and stores the originating path in `sessionStorage`.
- After successful authentication, the frontend consumes the stored return path and navigates the user back to the original route.
- The API uses `Auth:JwtExpirationMinutes` (default: 43200 minutes / 30 days) to control access token lifetime.

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
- `GET /hubs/clipboard`: SignalR hub that pushes clipboard updates to connected clients.

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

## Real-Time Clipboard Updates
The API exposes a SignalR hub at `/hubs/clipboard`. Authenticated clients connect with their JWT and are grouped per user. When a clipboard item is created, the API broadcasts a `ClipboardUpdated` event to the user's group so connected clients can refresh their clipboard list in real time.

## Configuration
Non-secret configuration lives in `config.json` files that sit alongside each app:

- `apps/api/src/config.json` (copied from `config.example.json`)
- `apps/web/public/config.json` (copied from `config.example.json`)

The web app can also use runtime injection via `apps/web/public/config.js` (copied from `config.example.js`) to avoid a bootstrap fetch.

Secrets and cloud credentials remain in environment variables. The API reads `Auth__JwtSigningKey` from the environment, and S3 access relies on standard AWS credential variables like `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (if applicable), along with `AWS_REGION` and `AWS_BUCKET_NAME` when running locally. See `README.md` for the full list.
