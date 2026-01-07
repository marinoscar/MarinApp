# AGENTS.md
## Codex Agent Instructions for This Repository

You are an AI coding agent working inside this repo. Follow these instructions strictly.
If anything is ambiguous, make the smallest reasonable assumption and document it in the PR/commit notes.

---

# 1) System Overview (Non-Negotiable)

This is a two-tier application:

## WebApp (Frontend)
- NodeJS + React + TypeScript
- UI: Material Design using **MUI**
- Theme: **Dark theme** by default
- Authentication: **Google Sign-In (OAuth 2.0)**
- API communication: **JWT-based** authorization for requests to the backend API

## API (Backend)
- C# ASP.NET Core WebAPI
- Secured using **JWT**
- Swagger enabled and accurate
- Controllers fully documented using **XML documentation**
- Follow **OpenAPI** standards and best practices
- All backend logic and all database access happens in the API (no DB access from the frontend)

**Golden rule:** The frontend is untrusted. Authorization is enforced on the backend.

---

# 2) Repository Layout Assumptions

Default structure (do not invent new top-level folders without reason):
- `apps/web/`   => React + TS app
- `apps/api/`   => ASP.NET Core WebAPI solution
- `docs/`       => architecture notes, OpenAPI output, ADRs
- `infra/`      => docker/devops (optional)

If the repo structure differs, adapt but keep the separation: web vs api.

---

# 3) Frontend Rules (React + TS + MUI)

## Must Do
- Use TypeScript strictly. Avoid `any` except as a last resort (and comment why).
- Use MUI components for layout and inputs wherever practical.
- Default to a clean dark theme with MUI `ThemeProvider` and `CssBaseline`.
- Keep UI logic in UI; keep business logic in the API.
- Create a single API client module (e.g., `src/services/apiClient.ts`) for HTTP calls.
- Add the JWT to requests using `Authorization: Bearer <token>` header.
- Show consistent loading and error states for all data fetching.

## Must Not Do
- Do not store secrets in the frontend (no client secrets).
- Do not implement “authorization” in the frontend beyond hiding UI elements.
- Do not call the database directly.
- Do not bypass JWT for API calls (except endpoints explicitly marked public).

## Google Auth (Frontend)
- Use OAuth 2.0 best practice for SPAs (Authorization Code with PKCE via a reputable library).
- Do not build OAuth flows manually unless explicitly requested.
- Treat Google tokens as input to be exchanged/validated by the backend.

---

# 4) Backend Rules (ASP.NET Core WebAPI + JWT)

## Must Do
- Enforce JWT auth on protected endpoints using standard ASP.NET Core authentication/authorization middleware.
- Enable Swagger/OpenAPI and keep it correct with accurate schemas and security definitions.
- Use XML documentation on controllers and public DTOs:
  - Enable XML doc generation in `.csproj`
  - Configure Swagger to include XML comments
- Use DTOs for requests/responses (never expose EF entities directly).
- Use async/await in controllers and data access. No sync-over-async.
- Use correct HTTP status codes and consistent error responses.

## Must Not Do
- Do not trust the frontend for authorization decisions.
- Do not leak secrets, stack traces, or internal exception details in API responses.
- Do not log tokens or sensitive user data.
- Do not implement ad-hoc “JWT parsing” manually; use the framework.

## OpenAPI Standards
- All endpoints must appear in Swagger with:
  - request/response schemas
  - example responses when helpful
  - documented error shapes
- JWT security scheme should be defined (Bearer token), and protected endpoints must require it.

---

# 5) Authentication Flow (Required Pattern)

Use this pattern unless explicitly changed:

1. User signs in with Google in the WebApp.
2. WebApp obtains an identity token (or auth code depending on library).
3. WebApp sends the Google token/code to the API endpoint (e.g., `POST /auth/google`).
4. API validates Google identity and issues **API JWT** (and optional refresh token).
5. WebApp uses API JWT for subsequent requests.

**Do not** have the API accept Google tokens as its long-term auth mechanism unless asked.

---

# 6) Documentation & Quality Gates

## Code Quality
- Prefer clear, maintainable code over cleverness.
- Add unit tests for non-trivial logic when feasible.
- Validate inputs (model validation) and return meaningful errors.

## API Documentation
- Every controller and action must include XML doc comments:
  - `<summary>` required
  - `<param>` required for each parameter
  - `<returns>` required
  - Document auth requirements in the comments and/or Swagger annotations

## Swagger Requirements
- Swagger must be enabled for local/dev.
- Swagger must show:
  - title/version
  - JWT bearer security scheme
  - XML comments included
  - sensible grouping/tags

---

# 7) Security Requirements (Hard Rules)

- Never store access tokens in `localStorage` unless explicitly required.
- If cookies are used, implement CSRF protection. If bearer tokens are used, prioritize XSS prevention.
- Lock down CORS to the known WebApp origin(s) only.
- Use HTTPS in production; do not weaken TLS settings.
- Use short-lived JWTs; keep payloads minimal.
- Implement rate limiting on auth endpoints when possible.

---

# 8) Performance Requirements

- Avoid chatty APIs; design endpoints that match UI needs.
- Use pagination for list endpoints.
- Use `AsNoTracking()` for read-only EF queries (if EF is in scope later).
- Avoid N+1 patterns and over-fetching.
- Use cancellation tokens for long-running requests.

---

# 9) Working Style for Agents

When implementing a feature:
1. Identify affected layer(s): `web` vs `api`
2. Propose the minimal endpoint contract (request/response DTOs)
3. Implement backend first (DTOs, controller, auth, docs, swagger)
4. Implement frontend integration (service call + UI)
5. Add basic tests if relevant
6. Update docs if behavior changed

If you must choose between speed and correctness:
- Choose correctness, security, and maintainability.

---

# 10) Definition of Done (Per Feature)

A feature is complete when:
- API endpoint exists, secured appropriately, and appears correctly in Swagger
- XML documentation exists for controllers/actions/DTOs
- Frontend uses MUI components and dark theme conventions
- Frontend calls API using JWT bearer auth
- Errors and loading states are handled
- No secrets are exposed
- No DB access exists outside the API

End of AGENTS.md
