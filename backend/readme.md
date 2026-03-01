# Prelegal — Backend

FastAPI backend for the Prelegal legal document platform. Handles auth, NDA PDF generation, and serves the statically-built frontend in production.

## Stack

|                 |                                        |
| --------------- | -------------------------------------- |
| Framework       | FastAPI + Python 3.12                  |
| Package manager | uv                                     |
| Database        | SQLite (aiosqlite)                     |
| Auth            | JWT via python-jose + bcrypt (passlib) |
| PDF             | WeasyPrint + markdown2                 |
| Logging         | structlog                              |

## Development

### Setup

```bash
uv sync
```

### Run

```bash
DATABASE_PATH=./prelegal.db uv run uvicorn app.main:app --reload
# http://localhost:8000
```

## API

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| `POST` | `/api/auth/signup`      | Create account → returns JWT         |
| `POST` | `/api/auth/login`       | Sign in → returns JWT                |
| `POST` | `/api/nda/generate-pdf` | Generate Mutual NDA PDF (WeasyPrint) |
| `GET`  | `/health`               | Liveness check                       |

Interactive docs available at `http://localhost:8000/docs` when running locally.

## Structure

```
app/
  auth.py          # JWT helpers (create, decode, hash, verify)
  config.py        # Env-based config (JWT secret, DB path, templates dir)
  database.py      # SQLite init (users table)
  logger.py        # structlog configuration
  main.py          # FastAPI app, middleware, lifespan
  routes/
    auth.py        # Signup + login endpoints
    health.py      # Health check
    nda.py         # PDF generation endpoint
    root.py        # GET /
  services/
    pdf_service.py # HTML assembly + WeasyPrint rendering
```

## Testing

```bash
uv run pytest                                       # run all tests
uv run pytest --cov=app --cov-report=term-missing  # with coverage (currently 92%)
```

45 tests across 4 files in `tests/`. See [`../docs/test-coverage-report.md`](../docs/test-coverage-report.md) for details.
