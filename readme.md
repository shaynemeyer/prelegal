# Prelegal

> **Status: Work in Progress** — Active development, target completion **March 6, 2026**.

Prelegal is a legal document platform that helps users create, preview, and download standard legal agreements without a lawyer.

## What's been built

### Legal document templates (`templates/`)

A dataset of 12 open-source legal agreement templates sourced from [Common Paper](https://commonpaper.com), created by a committee of 40+ attorneys. Licensed under CC BY 4.0.

| Template                              | File                            |
| ------------------------------------- | ------------------------------- |
| Mutual NDA Cover Page                 | `Mutual-NDA-coverpage.md`       |
| Mutual NDA                            | `Mutual-NDA.md`                 |
| Cloud Service Agreement (CSA)         | `CSA.md`                        |
| Service Level Agreement (SLA)         | `sla.md`                        |
| Design Partner Agreement              | `design-partner-agreement.md`   |
| Professional Services Agreement (PSA) | `psa.md`                        |
| Data Processing Agreement (DPA)       | `DPA.md`                        |
| Partnership Agreement                 | `Partnership-Agreement.md`      |
| Software License Agreement            | `Software-License-Agreement.md` |
| Pilot Agreement                       | `Pilot-Agreement.md`            |
| Business Associate Agreement (BAA)    | `BAA.md`                        |
| AI Addendum                           | `AI-Addendum.md`                |

### Mutual NDA Creator (`frontend/` + `backend/`)

A full-stack web app for generating a Mutual NDA:

1. **Sign up / sign in** — JWT-authenticated accounts
2. **Fill in a form** — purpose, dates, MNDA term, confidentiality, governing law, jurisdiction, and both parties' details
3. **Preview the completed NDA** — cover page with filled-in values and full standard terms with variables injected
4. **Download as PDF** — letter-format PDF generated server-side

## Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | Next.js 16 + TypeScript + shadcn/ui |
| State          | Zustand                             |
| Validation     | Zod + react-hook-form               |
| Backend        | FastAPI (Python) + uv               |
| Database       | SQLite                              |
| Auth           | JWT (python-jose + bcrypt)          |
| PDF generation | WeasyPrint                          |
| Deployment     | Single Docker container             |

## Running

### Docker (recommended)

Requires [Docker](https://docs.docker.com/get-docker/).

```bash
# Mac / Linux
./scripts/start-mac.sh     # builds image and starts container
./scripts/stop-mac.sh      # stops and removes container

# Linux
./scripts/start-linux.sh
./scripts/stop-linux.sh

# Windows (PowerShell)
./scripts/start-windows.ps1
./scripts/stop-windows.ps1
```

App runs at **http://localhost:8000**. The SQLite database is created fresh on each container start and persisted to a Docker volume (`prelegal-data`).

To use a custom port:

```bash
PORT=9000 ./scripts/start-mac.sh
```

### Local development

Run backend and frontend in separate terminals.

**Terminal 1 — backend:**

```bash
cd backend
uv sync
DATABASE_PATH=./prelegal.db uv run uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

**Terminal 2 — frontend:**

```bash
cd frontend
bun install
cp .env.local.example .env.local   # sets NEXT_PUBLIC_API_URL=http://localhost:8000
bun dev
# Runs on http://localhost:3000
```

## Testing

```bash
# Backend (from backend/)
uv run pytest --cov=app --cov-report=term-missing   # 92% coverage

# Frontend (from frontend/)
bun playwright test                                  # 19 e2e tests
```

See [`docs/test-coverage-report.md`](docs/test-coverage-report.md) for full coverage details and gap analysis.

## Progress

- [x] Legal document template dataset (12 templates)
- [x] V1 foundation: Docker, SQLite, JWT auth, start/stop scripts
- [x] Mutual NDA creator (form → preview → PDF download)
- [x] Backend tests (92% coverage) and frontend e2e tests (19 flows)
- [ ] Additional document creators
- [ ] AI chat for document drafting
- [ ] Document persistence
- [ ] Release
