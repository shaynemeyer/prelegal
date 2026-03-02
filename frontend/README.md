# Prelegal — Frontend

Next.js (TypeScript) frontend for the Prelegal legal document platform. Statically exported and served by the FastAPI backend in production.

## Stack

|           |                                                            |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 16 + TypeScript (`output: 'export'`)               |
| UI        | shadcn/ui + Tailwind CSS                                   |
| State     | Zustand (auth token in localStorage, session timeout hook) |
| Forms     | react-hook-form + Zod                                      |
| API       | Direct `fetch` to FastAPI — no tRPC, no Next.js API routes |

## Development

Requires the backend running at `http://localhost:8000` (see root README).

### Setup

```bash
bun install
cp .env.local.example .env.local   # sets NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run

```bash
bun dev   # http://localhost:3000
```

### Build

```bash
bun --bun next build   # outputs to out/
```

The `out/` directory is copied into the Docker image and served by FastAPI via `StaticFiles`.

## Routes

| Route         | Auth | Description                                         |
| ------------- | ---- | --------------------------------------------------- |
| `/login`      |      | Sign in with email + password                       |
| `/signup`     |      | Create an account                                   |
| `/`           | JWT  | Document selector + recent history                  |
| `/preview`    | JWT  | NDA preview + PDF download                          |
| `/doc-preview`| JWT  | Non-NDA document preview + PDF download             |

Auth-protected routes redirect to `/login` if no JWT is present in localStorage (`AuthGuard` component). Users are also automatically logged out after **10 minutes of inactivity** via the `useInactivityTimeout` hook.

## Testing

```bash
bun playwright test
```

42 Playwright e2e tests in `tests/`. See [`../docs/test-coverage-report.md`](../docs/test-coverage-report.md) for details.
