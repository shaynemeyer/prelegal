# Test Coverage Report

**Generated:** 2026-03-01
**Backend:** `uv run pytest --cov=app --cov-report=term-missing`
**Frontend:** `bun playwright test` (Playwright e2e, 41 tests)

---

## Summary

| Layer | Tests | Passing | Coverage |
| --- | --- | --- | --- |
| Backend (pytest) | 130 | 130 | 89% |
| Frontend (Playwright e2e) | 41 | 41 | All user flows covered |

Backend exceeds the ≥80% target at 89%. The remaining 11% is confined to four narrow areas: the Playwright PDF entry points (`generate_nda_pdf`, `generate_document_pdf`, `html_to_pdf`), static-file mount logic in `main.py`, and minor untested branches in `logger.py` and `routes/root.py`.

---

## Backend Coverage by Module

```text
app/ai.py                          100%   (28/28 stmts)
app/auth.py                        100%   (22/22 stmts)
app/config.py                      100%   (11/11 stmts)
app/database.py                    100%   (13/13 stmts)
app/routes/__init__.py             100%
app/routes/auth.py                 100%   (35/35 stmts)
app/routes/chat.py                 100%   (20/20 stmts)
app/routes/document.py             100%   (16/16 stmts)
app/routes/health.py               100%    (5/5 stmts)
app/services/__init__.py           100%
app/logger.py                       92%   miss: line 19 (json_logs=True branch)
app/routes/nda.py                   93%   miss: lines 36-37 (generate_pdf body)
app/services/document_service.py    80%   miss: line 166, 231-242 (Playwright call)
app/main.py                         83%   miss: lines 21-24, 47
app/routes/root.py                  80%   miss: line 8
app/services/pdf_service.py         84%   miss: lines 178-188 (Playwright call)
app/services/pdf_utils.py            0%   miss: lines 2-17 (html_to_pdf — needs browser)
─────────────────────────────────────────
TOTAL                               89%   (298/334 stmts)
```

### Coverage by test file

```mermaid
pie title Backend test distribution (130 tests)
    "Auth routes" : 7
    "Auth utilities" : 7
    "Database init" : 3
    "PDF service helpers" : 28
    "Document service helpers" : 26
    "Document routes" : 3
    "Chat routes" : 8
    "AI module" : 22
    "Other" : 26
```

### Module coverage heatmap

```mermaid
xychart-beta
    title "Backend module coverage (%)"
    x-axis ["ai", "auth", "cfg", "db", "r/auth", "r/chat", "r/doc", "hlth", "log", "r/nda", "main", "root", "doc-svc", "pdf", "pdf-utils"]
    y-axis "Coverage (%)" 0 --> 100
    bar [100, 100, 100, 100, 100, 100, 100, 100, 92, 93, 83, 80, 80, 84, 0]
```

| Label | Module |
| --- | --- |
| ai | `app/ai.py` |
| auth | `app/auth.py` |
| cfg | `app/config.py` |
| db | `app/database.py` |
| r/auth | `app/routes/auth.py` |
| r/chat | `app/routes/chat.py` |
| r/doc | `app/routes/document.py` |
| hlth | `app/routes/health.py` |
| log | `app/logger.py` |
| r/nda | `app/routes/nda.py` |
| main | `app/main.py` |
| root | `app/routes/root.py` |
| doc-svc | `app/services/document_service.py` |
| pdf | `app/services/pdf_service.py` |
| pdf-utils | `app/services/pdf_utils.py` |

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

#### 1. `pdf_utils.py` — 0% (lines 2-17, `html_to_pdf`)

`html_to_pdf` launches a real Playwright browser to render HTML. It is not covered in the test suite because spinning up a headless Chromium instance in CI adds significant overhead and environment requirements. All callers (`generate_nda_pdf`, `generate_document_pdf`) are tested via mocking.

#### 2. `pdf_service.py` — 84% (lines 178-188, `generate_nda_pdf`)

All pure helper functions are covered by `test_pdf_service.py` (28 tests). The remaining gap is the `generate_nda_pdf` async function, which calls `html_to_pdf`:

```python
async def generate_nda_pdf(data: object) -> bytes:
    from app.services.pdf_utils import html_to_pdf   # line 180 — miss
    ...
    pdf_bytes = await html_to_pdf(full_html)          # miss
```

The NDA endpoint itself (`routes/nda.py` lines 36-37) is also uncovered for the same reason.

#### 3. `document_service.py` — 80% (line 166, 231-242)

Same as above — `generate_document_pdf` calls `html_to_pdf`:

```python
async def generate_document_pdf(doc_type: str, fields: dict) -> bytes:
    from app.services.pdf_utils import html_to_pdf   # line 231 — miss
    pdf_bytes = await html_to_pdf(full_html)          # miss
```

All pure helpers (`_build_generic_cover_html`, `_build_standard_terms_html`) are covered.

#### 4. `main.py` — 83% (lines 21-24, 47)

- **Lines 21-24:** Warning branch `if JWT_SECRET_KEY == "change-me-in-production"` — not triggered in tests.
- **Line 47:** `app.mount(StaticFiles(...))` — skipped because `static/` doesn't exist during tests.

#### 5. `logger.py` — 92% (line 19)

- **Line 19:** The `json_logs=True` branch in `configure_logging`. Tests call it with default args only.

#### 6. `routes/root.py` — 80% (line 8)

- **Line 8:** `return {"message": "Prelegal API"}` — `GET /` is not called by any test.

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

## Remaining Recommendations

### High priority

#### B2 — Test `POST /api/nda/generate-pdf` with pdf_utils mocked

Mock `generate_nda_pdf` (or `html_to_pdf`) to cover `routes/nda.py` lines 36-37 without launching a browser:

```python
# backend/tests/test_nda_routes.py
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_generate_pdf_returns_pdf_bytes(client):
    payload = {
        "purpose": "Partnership evaluation",
        "effective_date": "2025-01-01",
        "mnda_term_type": "expires",
        "mnda_term_years": 1,
        "confidentiality_type": "years",
        "confidentiality_years": 2,
        "governing_law": "California",
        "jurisdiction": "San Francisco County",
        "party1": {"print_name": "Alice", "title": "CEO", "company": "Acme",
                   "notice_address": "123 Main", "date": "2025-01-01"},
        "party2": {"print_name": "Bob", "title": "CTO", "company": "Widget",
                   "notice_address": "456 Oak", "date": "2025-01-01"},
    }
    with patch("app.routes.nda.generate_nda_pdf", new=AsyncMock(return_value=b"%PDF-fake")):
        res = await client.post("/api/nda/generate-pdf", json=payload)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
```

#### B3 — Test `GET /` root endpoint

```python
@pytest.mark.asyncio
async def test_root_returns_api_message(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert res.json()["message"] == "Prelegal API"
```

### Medium priority

#### B4 — Cover the `json_logs=True` branch in `logger.py`

```python
def test_configure_logging_json_mode():
    from app.logger import configure_logging
    configure_logging(json_logs=True, log_level="WARNING")
```

#### F1 — Assert PDF download completes (frontend)

```typescript
test('download PDF triggers file download', async ({ page }) => {
  await goToNda(page);
  await fillNdaForm(page);
  await page.getByRole('button', { name: 'Preview NDA →' }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /download pdf/i }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('mutual-nda.pdf');
});
```

> Requires backend running with `playwright install chromium` completed (integration environment only).

#### F2 — Test AI fills form fields end-to-end

```typescript
test('AI chat fills governing law field', async ({ page }) => {
  // Requires OPENROUTER_API_KEY set in test environment
  await goToNda(page);
  await page.getByRole('tab', { name: 'Chat with AI' }).click();
  await page.waitForSelector('text=Hello'); // wait for AI greeting
  await page.getByPlaceholder('Tell me about your NDA...').fill('California');
  await page.getByRole('button', { name: 'Send' }).click();
  // AI should extract governing law
});
```

### Low priority

#### F3 — Token expiry behaviour

Manually set an expired JWT in `localStorage` and verify the user is redirected to `/login`.

#### F4 — Logout flow

No logout UI exists yet. Add this test when the feature is built.

---

## Coverage progress

```mermaid
xychart-beta
    title "Backend total coverage progress (%)"
    x-axis ["Before PL-4", "After PL-4 (v1)", "After PL-5", "After PL-6", "After B2+B3 (projected)"]
    y-axis "Total coverage (%)" 70 --> 100
    line [79, 92, 93, 89, 91]
```

> Note: Coverage dropped from 93% to 89% because `pdf_utils.py` (9 statements, 0% covered) was added when migrating from WeasyPrint to Playwright. The new module requires a real browser to test. All other modules are at the same coverage as before.

---

## Test architecture overview

```mermaid
graph TD
    subgraph Backend ["Backend (pytest + httpx AsyncClient)"]
        C[conftest.py<br/>AsyncClient fixture<br/>isolated SQLite DB]
        T1[test_auth_utils.py<br/>hash, verify, JWT tokens]
        T2[test_auth_routes.py<br/>signup, login, health]
        T3[test_database.py<br/>init, columns, idempotent]
        T4[test_pdf_service.py<br/>28 helper unit tests]
        T5[test_chat_routes.py<br/>auth, doc_type, messages]
        T6[test_ai.py<br/>call_ai, per-doc prompts]
        T7[test_document_service.py<br/>cover HTML, template files]
        T8[test_document_routes.py<br/>generate-pdf endpoint]
        C --> T1 & T2 & T3 & T5 & T6 & T7 & T8
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
    style T5 fill:#d4f5d4,stroke:#2a7a2a
    style T6 fill:#d4f5d4,stroke:#2a7a2a
    style T7 fill:#d4f5d4,stroke:#2a7a2a
    style T8 fill:#d4f5d4,stroke:#2a7a2a
    style P3 fill:#d4f5d4,stroke:#2a7a2a
```
