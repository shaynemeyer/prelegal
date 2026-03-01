# Prelegal Project

## Overview

SaaS product for drafting legal agreements from templates. Available documents are in `catalog.json`. Currently supports Mutual NDA generation only.

## Development process

When instructed to build a feature:

1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Write tests — backend unit + integration tests (pytest) AND frontend e2e tests (Playwright). Target ≥80% coverage. Do NOT skip this step.
4. Run all tests and fix any failures before opening a PR
5. Submit a PR using your github tools

## Testing

See `docs/test-coverage-report.md` for full coverage details and gap analysis.

## AI design

Use this code as an example https://github.com/shaynemeyer/agentic-pm/blob/main/backend/app/ai.py but update the system prompt to reflect the purpose of this app.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

Single Docker container: FastAPI backend (`backend/`) + statically exported Next.js frontend (`frontend/`) served via `StaticFiles`. SQLite at `/data/prelegal.db`. No Next.js API routes — frontend calls FastAPI directly.
