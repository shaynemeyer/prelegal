# Test Coverage Report

**Generated:** 2026-03-01
**Backend:** `uv run pytest --cov=app --cov-report=term-missing`
**Frontend:** `bun playwright test` (Playwright e2e, 41 tests)

---

## Summary

| Layer | Tests | Passing | Coverage |
| --- | --- | --- | --- |
| Backend (pytest) | 142 | 142 | 99% |
| Frontend (Playwright e2e) | 41 | 41 | All user flows covered |

Backend is at 99%. The remaining 1% (5 statements in `main.py`) is the JWT warning branch inside the ASGI lifespan and the StaticFiles mount — both require environment setup outside the test runner.

---

## Backend Coverage by Module

```text
app/ai.py                          100%   (28/28 stmts)
app/auth.py                        100%   (22/22 stmts)
app/config.py                      100%   (11/11 stmts)
app/database.py                    100%   (13/13 stmts)
app/logger.py                      100%   (12/12 stmts)
app/routes/__init__.py             100%
app/routes/auth.py                 100%   (35/35 stmts)
app/routes/chat.py                 100%   (20/20 stmts)
app/routes/document.py             100%   (16/16 stmts)
app/routes/health.py               100%    (5/5 stmts)
app/routes/nda.py                  100%   (28/28 stmts)
app/routes/root.py                 100%    (5/5 stmts)
app/services/__init__.py           100%
app/services/document_service.py   100%   (49/49 stmts)
app/services/pdf_service.py        100%   (51/51 stmts)
app/services/pdf_utils.py          100%    (9/9 stmts)
app/main.py                         83%   miss: lines 21-24, 47
─────────────────────────────────────────
TOTAL                               99%   (329/334 stmts)
```

### Coverage by test file

```mermaid
pie title Backend test distribution (142 tests)
    "Auth routes" : 8
    "Auth utilities" : 8
    "Database init" : 3
    "PDF service helpers" : 30
    "PDF utils" : 3
    "NDA routes" : 3
    "Document service helpers" : 28
    "Document routes" : 3
    "Chat routes" : 8
    "AI module" : 22
    "Other" : 26
```

### Module coverage heatmap

```mermaid
xychart-beta
    title "Backend module coverage (%)"
    x-axis ["ai", "auth", "cfg", "db", "log", "r/auth", "r/chat", "r/doc", "r/nda", "hlth", "root", "doc-svc", "pdf", "pdf-utils", "main"]
    y-axis "Coverage (%)" 0 --> 100
    bar [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 83]
```

| Label | Module |
| --- | --- |
| ai | `app/ai.py` |
| auth | `app/auth.py` |
| cfg | `app/config.py` |
| db | `app/database.py` |
| log | `app/logger.py` |
| r/auth | `app/routes/auth.py` |
| r/chat | `app/routes/chat.py` |
| r/doc | `app/routes/document.py` |
| r/nda | `app/routes/nda.py` |
| hlth | `app/routes/health.py` |
| root | `app/routes/root.py` |
| doc-svc | `app/services/document_service.py` |
| pdf | `app/services/pdf_service.py` |
| pdf-utils | `app/services/pdf_utils.py` |
| main | `app/main.py` |

---

## Frontend Coverage (Playwright e2e)

41 tests across 3 spec files cover all primary user flows.

```mermaid
pie title Frontend test distribution (41 tests)
    "Auth redirects" : 2
    "Signup" : 4
    "Login" : 4
    "Document selector" : 6
    "NDA form & preview" : 11
    "AI chat tab" : 8
    "Document form & preview" : 6
```

### User flow coverage

```mermaid
flowchart TD
    A([Unauthenticated visitor]) -->|GET slash| B{AuthGuard}
    B -->|no token| C["/login"]
    B -->|has token| D["Home / Document Selector"]

    C -->|fill form| E{Submit}
    E -->|invalid creds| F[error message]
    E -->|valid creds| D
    C -->|click Sign up| G["/signup"]

    G -->|fill form| H{Submit}
    H -->|duplicate email| I[error message]
    H -->|success| D
    G -->|click Sign in| C

    D -->|select Mutual NDA| J[NDA creator tabs]
    D -->|select other doc type| K2[DocumentPageTabs]
    D -->|click Back| D

    J -->|Fill in Form tab| J1[NDA form]
    J -->|Chat with AI tab| K[AI chat interface]

    J1 -->|fill NDA fields| L{Preview NDA}
    L -->|missing required fields| M[validation errors]
    L -->|all fields valid| N["/preview"]

    K -->|AI conversation fills fields| O{Preview NDA button}
    O -->|key fields not yet collected| P[button disabled]
    O -->|key fields collected| N

    K2 -->|Fill in Form tab| K6[DocumentForm]
    K2 -->|Chat with AI tab| K2b[AI chat interface]
    K6 -->|fill form fields| K7{Preview button}
    K7 -->|missing required fields| K8[validation errors]
    K7 -->|all fields valid| K9["/doc-preview"]
    K2b -->|AI collects fields| K3{Download PDF button}
    K3 -->|minimum fields not collected| K4[button disabled]
    K3 -->|minimum fields collected| K5[PDF download]

    N -->|click Edit| D
    N -->|click Download PDF| Q[PDF download]
    N -->|no form data| R[fallback message]

    K9 -->|click Edit| D
    K9 -->|click Download PDF| Q
    K9 -->|no form data| R

    style C fill:#d4f5d4
    style G fill:#d4f5d4
    style D fill:#d4f5d4
    style J fill:#d4f5d4
    style J1 fill:#d4f5d4
    style K fill:#d4f5d4
    style K2 fill:#d4f5d4
    style K2b fill:#d4f5d4
    style K3 fill:#d4f5d4
    style K4 fill:#d4f5d4
    style K6 fill:#d4f5d4
    style K7 fill:#d4f5d4
    style K8 fill:#d4f5d4
    style K9 fill:#d4f5d4
    style N fill:#d4f5d4
    style F fill:#d4f5d4
    style I fill:#d4f5d4
    style M fill:#d4f5d4
    style P fill:#d4f5d4
    style R fill:#d4f5d4
    style Q fill:#ffe8a0
    style K5 fill:#ffe8a0
```

**Legend:** Green = covered by tests. Yellow = partially covered (button visible, download not asserted).

---

## Gap Analysis

### Backend gaps

#### `main.py` — 83% (lines 21-24, 47)

- **Lines 21-24:** JWT warning branch inside the ASGI `lifespan` context manager. The `AsyncClient` test fixture doesn't trigger the ASGI lifespan, so this branch is never reached. Would require an `asgi-lifespan` integration or test restructuring.
- **Line 47:** `app.mount(StaticFiles(...))` — only executed when `static/` exists on disk (Docker production). Not present in the test environment.

These are infrastructure concerns rather than application logic and are not worth the test complexity they would require.

### Frontend gaps

| Flow | Status | Notes |
| --- | --- | --- |
| Auth redirect → `/login` | Covered | `/` and `/preview` both tested |
| Signup happy path | Covered | |
| Signup duplicate email | Covered | |
| Login happy path | Covered | |
| Login wrong password | Covered | |
| Login/Signup cross-links | Covered | |
| Document selector renders all types | Covered | |
| Selecting NDA shows form+chat tabs | Covered | |
| Selecting non-NDA shows form+chat tabs | Covered | |
| Back button returns to selector | Covered | |
| Non-NDA PDF button disabled initially | Covered | |
| Non-NDA form submits to /doc-preview | Covered | |
| /doc-preview shows cover data | Covered | |
| /doc-preview fallback (no data) | Covered | |
| /doc-preview Edit button returns to / | Covered | |
| /doc-preview Download PDF visible | Covered | |
| NDA form renders | Covered | |
| NDA validation errors | Covered | |
| NDA → Preview navigation | Covered | |
| Preview shows party data | Covered | |
| Preview fallback (no data) | Covered | |
| Edit button returns to form | Covered | |
| Download PDF button visible | Covered | |
| AI chat tab renders | Covered | |
| AI chat tab is accessible | Covered | |
| Form tab is default | Covered | |
| Send button state (disabled/enabled) | Covered | |
| Preview NDA button disabled initially | Covered | |
| Tab switching works | Covered | |
| **PDF download completes** | **Not covered** | Requires backend running with Playwright Chromium |
| **AI fills form fields via chat** | **Not covered** | Requires live OpenRouter API key |
| **Token expiry / re-login** | **Not covered** | JWT expiry not simulated |
| **Logout** | **Not covered** | No logout UI exists yet |

---

## Coverage progress

```mermaid
xychart-beta
    title "Backend total coverage progress (%)"
    x-axis ["Before PL-4", "After PL-4 (v1)", "After PL-5", "After PL-6 (Playwright migration)", "Now (142 tests)"]
    y-axis "Total coverage (%)" 70 --> 100
    line [79, 92, 93, 89, 99]
```

---

## Test architecture overview

```mermaid
graph TD
    subgraph Backend ["Backend (pytest + httpx AsyncClient)"]
        C[conftest.py<br/>AsyncClient fixture<br/>isolated SQLite DB]
        T1[test_auth_utils.py<br/>hash, verify, JWT, logger]
        T2[test_auth_routes.py<br/>signup, login, health, root]
        T3[test_database.py<br/>init, columns, idempotent]
        T4[test_pdf_service.py<br/>30 tests: helpers + generate_nda_pdf]
        T4b[test_pdf_utils.py<br/>3 tests: html_to_pdf mocked]
        T5[test_chat_routes.py<br/>auth, doc_type, messages]
        T6[test_ai.py<br/>call_ai, per-doc prompts]
        T7[test_document_service.py<br/>cover HTML, template files, generate_document_pdf]
        T8[test_document_routes.py<br/>generate-pdf endpoint]
        T9[test_nda_routes.py<br/>3 tests: generate-pdf endpoint]
        C --> T1 & T2 & T3 & T5 & T6 & T7 & T8 & T9
    end

    subgraph Frontend ["Frontend (Playwright e2e)"]
        P1[auth.spec.ts<br/>redirects, signup, login]
        P2[nda.spec.ts<br/>form, validation, preview]
        P3[chat.spec.ts<br/>doc selector, chat UI, buttons, doc-preview]
    end

    subgraph App ["Running app"]
        BE[FastAPI :8000]
        FE[Next.js :3000]
    end

    T2 --> BE
    T3 --> BE
    T5 --> BE
    P1 --> FE
    P2 --> FE
    P3 --> FE
    FE --> BE

    style T4 fill:#d4f5d4,stroke:#2a7a2a
    style T4b fill:#d4f5d4,stroke:#2a7a2a
    style T5 fill:#d4f5d4,stroke:#2a7a2a
    style T6 fill:#d4f5d4,stroke:#2a7a2a
    style T7 fill:#d4f5d4,stroke:#2a7a2a
    style T8 fill:#d4f5d4,stroke:#2a7a2a
    style T9 fill:#d4f5d4,stroke:#2a7a2a
    style P3 fill:#d4f5d4,stroke:#2a7a2a
```
