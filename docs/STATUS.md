# TeachAssist Status

> **Last Updated:** 2026-01-30
> **Current Phase:** Feature Complete - Ready for Pilot

---

## Overview

TeachAssist is a teacher-first professional operating system. The v0.1 pilot focuses on:
1. **Knowledge Base** - Upload curriculum sources (files + URLs), ask grounded questions with citations
2. **Inner Council** - AI advisory personas that review work and ask reflective questions
3. **Source Transforms** - Summarize, extract misconceptions, map standards, generate questions
4. **Narrative Comment Synthesis** - Help teachers transform semester data into student narratives

---

## What's Built

### Backend (FastAPI) - 100% Complete

| Component | Status | Notes |
|-----------|--------|-------|
| Health endpoint | ✅ Working | `/health`, `/health/ready`, `/health/live` |
| Sources API | ✅ Working | Upload, list, delete, stats |
| **URL Ingestion** | ✅ Working | Web page scraping with BeautifulSoup |
| Chat API | ✅ Working | Grounded Q&A with citations |
| **Chat Transforms** | ✅ Working | Summarize, extract, map standards, generate questions |
| Council API | ✅ Working | Persona consultation |
| Narratives API | ✅ Working | Synthesis, batch, edit, export |
| Knowledge Service | ✅ Working | InMemoryVectorStore + OpenAI embeddings |
| Personas | ✅ Working | 4 YAML files in `personas/` |
| Planning API | 🟡 Scaffolded | Endpoints exist, not implemented (v0.2) |
| Grading API | 🟡 Scaffolded | Endpoints exist, not implemented (v0.2) |

### Frontend (Next.js) - 95% Complete

| Component | Status | Notes |
|-----------|--------|-------|
| App shell | ✅ Working | GlobalLayout, theme, providers |
| Welcome page | ✅ Working | Hero, quick start, activity, compliance |
| Sources UI | ✅ Working | Upload files, list, delete, stats |
| **URL Uploader** | ✅ Working | Tab-based file/URL upload switching |
| **Transform Panel** | ✅ Working | Modal with transform options per source |
| Chat UI | ✅ Working | RAG with citations display |
| Council UI | ✅ Working | Persona selection, consultation |
| Narratives UI | ✅ Working | Full wizard (8 components) |
| Notebook mode | ✅ Working | Two-column sources + chat |
| Theme toggle | ✅ Working | Dark/light mode |
| Accommodations | ✅ Working | IEP/504 toggle |
| **AI Assistant** | ✅ Working | FAB with animations, quick actions, suggestions |
| **Help Center** | ✅ Working | 15+ teacher help articles, searchable |

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

## Recent Updates (2026-01-30)

### Feature Branch Merge Complete
- **URL Ingestion** - Web page scraping into knowledge base (+744 lines)
- **Source Transforms** - Summarize, extract misconceptions, map standards (+594 lines)
- **AI Assistant** - Floating action button with animations and suggestions (+222 lines)

### Repository Cleanup
- Merged 3 feature branches to main
- Deleted 9 local feature branches
- Deleted 2 remote feature branches
- Removed 4 worktrees
- Moved documentation to `docs/` per repo hygiene standards

---

## Next Steps

1. **Deploy to Production** - See `docs/MASTER_PLAN.md` for deployment steps
2. **Pilot Testing** - Test with 3-5 pilot teachers
3. **Collect Feedback** - Usage patterns and feature requests
4. **v0.2 Planning** - Grade Studio, Plan Studio, Google OAuth
