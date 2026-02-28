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

A full-stack prototype web app (PL-3) for generating a Mutual NDA:

1. **Fill in a form** — purpose, dates, MNDA term, confidentiality, governing law, jurisdiction, and both parties' details
2. **Preview the completed NDA** — cover page with filled-in values and full standard terms with variables injected
3. **Download as PDF** — letter-format PDF generated server-side

## Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | Next.js 16 + TypeScript + shadcn/ui |
| API layer      | tRPC v11 + TanStack Query           |
| State          | Zustand                             |
| Validation     | Zod + react-hook-form               |
| Backend        | FastAPI (Python) + uv               |
| PDF generation | WeasyPrint                          |

## Running locally

**Backend:**

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

**Frontend:**

```bash
cd frontend
bun install
cp .env.local.example .env.local
bun dev
# Runs on http://localhost:3000
```

## Progress

- [x] Legal document template dataset (12 templates)
- [x] Mutual NDA creator prototype (form → preview → PDF download)
- [ ] Additional document creators
- [ ] Testing
- [ ] Documentation
- [ ] Release
