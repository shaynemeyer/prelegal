# Stage 1: Build Next.js static frontend
FROM oven/bun:1 AS frontend-builder

WORKDIR /frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
COPY templates/ ../templates/

RUN bun --bun next build


# Stage 2: Runtime — Python + FastAPI serving API and static files
FROM python:3.12-slim AS runtime

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy backend
COPY backend/ ./backend/

# Install Python dependencies
WORKDIR /app/backend
RUN uv sync --frozen --no-dev

# Install Playwright Chromium and its system dependencies
RUN uv run playwright install --with-deps chromium

# Copy templates and catalog
COPY templates/ /app/templates/
COPY catalog.json /app/catalog.json

# Copy static frontend files built in stage 1
COPY --from=frontend-builder /frontend/out /app/backend/static/

# Create data directory for SQLite
RUN mkdir -p /data

WORKDIR /app/backend

ENV TEMPLATES_DIR=/app/templates
ENV DATABASE_PATH=/data/prelegal.db

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
