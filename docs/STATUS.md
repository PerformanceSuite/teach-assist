# TeachAssist Status

> **Last Updated:** 2026-01-26

---

## Overview

TeachAssist is a teacher-first professional operating system. The v0.1 pilot focuses on:
1. **Knowledge Base** - Upload curriculum sources, ask grounded questions with citations
2. **Inner Council** - AI advisory personas that review work and ask reflective questions
3. **Narrative Comment Synthesis** - Help teachers transform semester data into student narratives

---

## What's Built

### Backend (FastAPI) - ~95% Complete

| Component | Status | Notes |
|-----------|--------|-------|
| Health endpoint | ✅ Working | `/health` |
| Sources API | ✅ Working | Upload, list, delete, search |
| Chat API | ✅ Working | Grounded Q&A with citations |
| Council API | ✅ Working | Persona consultation |
| **Narratives API** | ✅ Working | Semester comment synthesis, IB criteria, batch processing |
| Knowledge Service | ✅ Working | InMemoryVectorStore (numpy-based) |
| Personas | ✅ Created | 4 YAML files in `personas/` |
| Planning API | 🟡 Partial | Endpoints exist, not fully tested |
| Grading API | 🟡 Partial | Endpoints exist, not fully tested |

**Backend Routers:**
- `backend/api/routers/health.py`
- `backend/api/routers/sources.py`
- `backend/api/routers/chat.py`
- `backend/api/routers/council.py`
- `backend/api/routers/narratives.py` ⭐ NEW
- `backend/api/routers/planning.py`
- `backend/api/routers/grading.py`

### Frontend (Next.js) - ~30% Complete

| Component | Status | Notes |
|-----------|--------|-------|
| App shell | ✅ Working | Basic layout and navigation |
| Welcome page | 🟡 Partial | Components exist, needs polish |
| Sources UI | 🟡 Partial | Components exist at `components/Sources/` |
| Chat UI | 🟡 Partial | Route exists at `app/chat/` |
| Council UI | 🟡 Partial | Route exists at `app/council/` |
| Help Center | 🟡 Partial | Components at `components/HelpCenter/` |
| AI Assistant | 🟡 Partial | Components at `components/AIAssistant/` |

**Frontend Routes:**
- `app/page.tsx` - Landing/welcome
- `app/app/` - Authenticated portal shell
- `app/chat/` - Chat interface
- `app/council/` - Inner Council
- `app/sources/` - Source management

**Frontend Components:**
- `components/Welcome/`
- `components/Sources/`
- `components/notebook/` (rename pending)
- `components/HelpCenter/`
- `components/AIAssistant/`
- `components/Shell.tsx`
- `components/GlobalLayout.tsx`

---

## Pilot User Context

**User Profile:** IB Science teacher (6th-7th grade), Washington State

### Real Workflow (from pilot user, 2026-01-26)

The pilot user shared her actual weekend workflow for writing narrative comments:

> "These are narrative comments summarizing student achievement and areas for growth for the semester. I relied heavily on [AI tools] to help process the data around students (using initials, to stay in compliance with FERPA and COPPA). And I edited what I got, as needed. For now, they're in a Word doc, but they'll get posted to ISAMS, our student management system."

**Data volume she manages:**
- 4 units per semester per class
- Each unit has at least 1 summative assessment
- Must assess each of 4 IB criteria twice per semester (8+ criterion assessments)
- Formative assignments can be daily
- Bio class also has daily check-in data in spreadsheets

**Key insight:** The real job-to-be-done is **synthesis** - transforming scattered semester data (grades, formatives, check-ins, spreadsheets) into coherent narrative comments for each student.

### Implications for TeachAssist

1. **Privacy workflow:** She manually anonymizes (uses initials). This is friction we could reduce.
2. **Multi-source data:** Data is scattered across gradebooks, spreadsheets, notes. TeachAssist should help aggregate.
3. **Output destination:** Final narratives go to ISAMS (student management system). Export format matters.
4. **Teacher edits:** AI output is a draft. She always edits "as needed."

---

## What's Not Built (Out of Scope for v0.1)

- Sunday Rescue Mode (batch grading + planning) - v0.2
- Plan Studio (UbD lesson builder) - v0.2
- Grade Studio (rubric + batch comments) - v0.2
- Multi-user authentication - v0.2
- AI grading (always forbidden)

---

## Technical Stack

**Backend:**
- FastAPI
- InMemoryVectorStore (numpy + sentence-transformers)
- YAML personas
- File system storage (no database in v0.1)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- lucide-react (icons)

---

## Quick Start

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Test
curl http://localhost:8002/health
```

### Frontend
```bash
npm run dev
# Visit http://localhost:3000
```

---

## Narratives API (NEW - 2026-01-26)

The Narratives API is the core feature for the pilot user's workflow.

**Endpoints:**
- `POST /api/v1/narratives/synthesize` - Generate 1-10 student narratives (sync)
- `POST /api/v1/narratives/batch` - Batch processing for 10+ students (async)
- `GET /api/v1/narratives/batch/{id}` - Check status / retrieve results
- `PUT /api/v1/narratives/batch/{id}/edit` - Teacher edits drafts
- `GET /api/v1/narratives/batch/{id}/export` - Export CSV/TXT/JSON for ISAMS
- `POST /api/v1/narratives/rubric/ib-science` - Load IB MYP criteria

**Features:**
- 4-sentence structure (achievement, evidence, growth, outlook)
- IB MYP Science criteria built-in (Criteria A-D, 1-8 scale)
- Student clustering by growth area
- Cross-student pattern detection
- Optional Inner Council review before teacher sees drafts
- FERPA-safe by design (initials only)

**Tested:** Rubric loading ✅, narrative synthesis ✅, TXT export ✅

---

## Next Steps

1. **Build Narratives UI** - Form to input students, display/edit narratives, export
2. **Consider Google integration** - Sheets add-on or Drive integration for pilot user's existing workflow
3. **Connect other frontend components** - Wire Sources, Chat, Council UI to backend
4. **User testing** - Get pilot user feedback on the actual tool
