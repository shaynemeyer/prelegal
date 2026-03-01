# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports Mutual NDA document generation. Additional document types, AI chat, and document persistence are not yet implemented.

## Development process

When instructed to build a feature:

1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Write tests — backend unit + integration tests (pytest) AND frontend e2e tests (Playwright). Target ≥80% coverage. Do NOT skip this step.
4. Run all tests and fix any failures before opening a PR
5. Submit a PR using your github tools

## Testing

See `docs/test-coverage-report.md` for full coverage details and gap analysis.

**Backend** (`backend/tests/`): pytest + pytest-asyncio + httpx `AsyncClient`. Run with `uv run pytest`.

- Each test gets a fresh SQLite DB via `tmp_path` + `monkeypatch` on `app.database.DATABASE_PATH`
- Target ≥80% coverage: `uv run pytest --cov=app --cov-report=term-missing`

**Frontend** (`frontend/tests/`): Playwright. Run with `bun playwright test`.

- Target ≥80% coverage of user-facing flows

## AI design

Use this code as an example https://github.com/shaynemeyer/agentic-pm/blob/main/backend/app/ai.py but update the system prompt to reflect the purpose of this app.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

Similar archicture example: https://github.com/shaynemeyer/agentic-pm

The entire project is packaged into a single Docker container.
The backend is in `backend/` — a `uv` project using FastAPI, available at http://localhost:8000.
The frontend is in `frontend/` — Next.js with TypeScript, statically built (`output: 'export'`) and served by FastAPI via `StaticFiles`. There are no Next.js API routes; the frontend calls FastAPI directly.
The database uses SQLite at `/data/prelegal.db`, created from scratch each time the Docker container starts, with a `users` table for sign up and sign in.
Scripts are in `scripts/`:

```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

Backend available at http://localhost:8000

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Frontend stack

- Next.js (TypeScript), statically exported — no server-side runtime in production
- shadcn/ui components, Tailwind CSS
- Zustand for state (auth token persisted to localStorage, NDA form data in memory)
- react-hook-form + Zod for form validation
- Direct `fetch` calls to the FastAPI backend — **tRPC is not used**

## Implementation Status

### Done (PL-4)

- Single-container Docker setup with multi-stage Dockerfile
- SQLite DB with `users` table, initialised on startup
- JWT auth: `POST /api/auth/signup`, `POST /api/auth/login` (bcrypt + python-jose)
- Login and signup pages; `AuthGuard` client-side route protection
- Mutual NDA form → preview → PDF download (WeasyPrint)
- Start/stop scripts for Mac, Linux, Windows

### Not yet built

- AI chat for document drafting
- Additional document types (CSA, SLA, DPA, PSA, BAA, etc.)
- Document persistence (saving/loading past agreements)
- User profile / document management UI
