# AGENTS.md
## Universal AI Agent Instructions for This Repository

You are an AI coding agent working inside this repository.
These rules define *how* you must work, not *what* you are building.

If instructions conflict, this file always takes precedence.

---

# 1. Architectural Principles (Non-Negotiable)

This repository follows a **strict separation of concerns**:

## Frontend
- React + TypeScript (NodeJS-based toolchain)
- UI concerns only (presentation, user interaction, state)
- Never accesses databases directly
- Communicates with backend APIs exclusively over HTTP

## Backend
- ASP.NET Core WebAPI (C#)
- Owns:
  - authentication & authorization
  - business logic
  - validation
  - persistence
  - integrations (storage, external APIs)
- All backend endpoints are asynchronous
- All data access flows through the API

## Persistence & External Services
- Databases and object storage are accessed **only by the backend**
- Frontend never holds secrets or credentials

**Golden rule:** The frontend is untrusted. All enforcement happens in the API.

---

# 2. Security Standards (Hard Rules)

Agents MUST:
- Enforce authentication and authorization in the backend
- Validate JWTs using framework middleware (issuer, audience, signature, expiration)
- Lock down CORS to known frontend origins
- Use HTTPS in production
- Avoid logging secrets, tokens, or sensitive data
- Implement per-user or per-tenant authorization checks on protected resources

Agents MUST NOT:
- Trust client-provided identifiers or claims without validation
- Store secrets in frontend code
- Implement ad-hoc crypto or token parsing
- Expose internal errors or stack traces in API responses
- Use wildcard CORS with credentials

---

# 3. Authentication & Authorization Guidance

- OAuth providers may be used for login
- The backend is responsible for issuing and validating its own access tokens
- Tokens must be short-lived
- Authorization decisions must live exclusively in the backend

Token storage strategy (cookies vs headers) must be:
- Explicitly chosen
- Documented in architecture docs
- Implemented consistently

---

# 4. Backend API Standards (ASP.NET Core)

Agents MUST:
- Use async/await end-to-end
- Use DTOs for request/response contracts
- Document all public controllers and actions with XML documentation
- Enable and maintain accurate Swagger/OpenAPI output
- Use correct HTTP status codes
- Validate input models explicitly
- Use cancellation tokens for I/O-bound operations

Agents MUST NOT:
- Expose EF entities directly
- Block on async calls
- Implement business logic in controllers
- Leak internal implementation details

---

# 5. Frontend Standards (React + TypeScript)

Agents MUST:
- Use TypeScript strictly
- Keep components focused on UI concerns
- Centralize API calls in service/client modules
- Handle loading, error, and empty states explicitly
- Follow Material Design conventions when using MUI

Agents MUST NOT:
- Embed backend business rules in the UI
- Access persistence layers directly
- Hardcode secrets or environment-specific values
- Assume frontend authorization is sufficient

---

# 6. Documentation Is a First-Class Artifact

Agents MUST keep documentation in sync with the code.

Whenever you:
- add or modify API endpoints
- change authentication or token flows
- introduce new storage mechanisms
- change environment variables
- add non-trivial features

You MUST update:
- `README.md` (setup, configuration, usage)
- `docs/architecture.md` (design, flows, responsibilities)

Documentation drift is considered a defect.

---

# 7. OpenAPI & Swagger Requirements

- Swagger must accurately reflect the current API
- Security schemes must be defined correctly
- Request and response schemas must be accurate
- XML documentation must be included in Swagger output
- Breaking API changes must be documented

---

# 8. Performance & Reliability Expectations

Agents SHOULD:
- Design APIs that minimize round-trips
- Use pagination for collection endpoints
- Avoid N+1 query patterns
- Use streaming for large payloads
- Prefer clarity and predictability over premature optimization

Agents MUST NOT:
- Create chatty APIs
- Return unbounded datasets
- Load large object graphs unnecessarily

---

# 9. Working Style for Agents

When implementing changes:
1. Identify affected layers (frontend, backend, docs)
2. Define or confirm contracts (DTOs, endpoints)
3. Implement backend first
4. Implement frontend integration
5. Update documentation
6. Add tests where logic is non-trivial

When uncertain:
- Ask clarifying questions
- Make minimal assumptions
- Document assumptions made

---

# 10. Definition of Done

A change is complete when:
- Code compiles and runs
- Security rules are followed
- APIs are documented and visible in Swagger
- UI integrates correctly with the API
- README.md and architecture.md are updated if needed
- No secrets or unsafe patterns are introduced

End of AGENTS.md
