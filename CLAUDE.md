# CLAUDE.md - TeachAssist Execution Guide

> **This file guides autonomous execution via Claude Code CLI**
> **Last Updated:** 2026-02-10

---

## CURRENT MISSION

**Build TeachAssist v0.1 Pilot** - Teacher OS with Knowledge Base + Inner Council

**Current Phase:** Feature Complete - Ready for Pilot
**Status:** `docs/STATUS.md`

---

## PROGRESS SUMMARY

| Component | Status | Completion |
|-----------|--------|------------|
| Backend Foundation | ✅ Complete | 100% |
| Knowledge Service | ✅ Complete | 100% |
| API Endpoints | ✅ Complete | 100% |
| Narratives API | ✅ Complete | 100% |
| URL Ingestion | ✅ Complete | 100% |
| Source Transforms | ✅ Complete | 100% |
| Personas | ✅ Complete | 100% |
| **Plan Studio** | ✅ Complete | 100% |
| Frontend UX | ✅ Complete | 98% |
| AI Assistant | ✅ Complete | 100% |
| Help Center | ✅ Complete | 100% |
| **OVERALL** | **✅ Ready for Pilot** | **99%** |

---

## COMPLETED (Session: 2026-02-10)

### Plan Studio - COMPLETE
- [x] **PlanningStore** - File-based storage for units/lessons (`backend/libs/planning_store.py`)
- [x] **Planning Router** - LLM-powered unit/lesson generation with student personalization
- [x] **Frontend Store** - Zustand store with persistence (`stores/planningStore.ts`)
- [x] **API Client** - Added planning types and methods to `lib/api.ts`
- [x] **Plan Studio Page** - Tab-based UI with unit/lesson forms, results display

---

## COMPLETED (Session: 2026-01-30)

### Feature Branch Merge - COMPLETE
- [x] **URL Ingestion** - Web page scraping into knowledge base
- [x] **Source Transforms** - Summarize, extract misconceptions, map standards
- [x] **AI Assistant** - FAB with animations, quick actions, suggestions
- [x] **Help Center** - 15+ teacher help articles
- [x] **Repo Hygiene** - Moved docs to proper locations

### Branch Cleanup - COMPLETE
- [x] Merged 3 feature branches to main
- [x] Deleted 9 local feature branches
- [x] Deleted 2 remote feature branches
- [x] Removed 4 worktrees

---

## KEY FILES

| Purpose | Path |
|---------|------|
| **Status** | `docs/STATUS.md` |
| **PRD** | `docs/PRD.md` |
| **Master Plan** | `docs/MASTER_PLAN.md` |
| API Spec | `docs/API_SPEC.md` |
| Backend Entry | `backend/api/main.py` |
| Knowledge Service | `backend/libs/knowledge_service.py` |
| Web Ingester | `backend/libs/web_ingester.py` |
| **Planning Store** | `backend/libs/planning_store.py` |
| **Planning Router** | `backend/api/routers/planning.py` |
| **Plan Studio Page** | `app/app/plan/page.tsx` |
| Personas | `personas/*.yaml` (4 files) |

---

## QUICK START COMMANDS

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

### Testing
```bash
# Test document upload
curl -X POST http://localhost:8002/api/v1/sources/upload \
  -F "file=@test.pdf" -F "title=Test Doc"

# Test URL ingestion
curl -X POST http://localhost:8002/api/v1/sources/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","title":"Example"}'

# Test chat
curl -X POST http://localhost:8002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the main topic?"}'

# Test Inner Council
curl -X POST http://localhost:8002/api/v1/council/consult \
  -H "Content-Type: application/json" \
  -d '{"persona": "standards-guardian", "context": "Forces lesson", "question": "Standards alignment?"}'

# Test Unit Planning
curl -X POST http://localhost:8002/api/v1/planning/unit \
  -H "Content-Type: application/json" \
  -d '{"title":"Forces","grade":8,"subject":"Science","duration_weeks":2,"standards":["NGSS MS-PS2-1"]}'

# Test Lesson Planning
curl -X POST http://localhost:8002/api/v1/planning/lesson \
  -H "Content-Type: application/json" \
  -d '{"topic":"Introduction to Forces","duration_minutes":50,"format":"detailed"}'
```

---

## SUCCESS CRITERIA (v0.1 Pilot)

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Upload curriculum sources | ✅ | ✅ | **Ready** |
| URL/webpage ingestion | ✅ | ✅ | **Ready** |
| Ask grounded questions | ✅ | ✅ | **Ready** |
| Source transforms | ✅ | ✅ | **Ready** |
| Inner Council consultation | ✅ | ✅ | **Ready** |
| **Plan Studio (Units)** | ✅ | ✅ | **Ready** |
| **Plan Studio (Lessons)** | ✅ | ✅ | **Ready** |
| Welcome Dashboard | N/A | ✅ | **Ready** |
| AI Assistant | N/A | ✅ | **Ready** |
| Help Center | N/A | ✅ | **Ready** |

---

## OUT OF SCOPE (v0.1)

These are future features, NOT in pilot:
- Batch grading (Grade Studio) → v0.2
- Lesson planning (Plan Studio) → v0.2
- Sunday Rescue Mode → v0.2
- Multi-user authentication → v0.2
- AI grading (always forbidden)

---

## ARCHITECTURAL NOTES

### Backend Stack
- **Framework:** FastAPI
- **Knowledge:** InMemoryVectorStore (numpy + sentence-transformers)
- **Web Scraping:** httpx + BeautifulSoup4
- **Personas:** YAML files + PersonaStore
- **Storage:** File system (no database in v0.1)

### Frontend Stack
- **Framework:** Next.js 15 (App Router)
- **State:** Zustand
- **UI:** Tailwind CSS + lucide-react
- **Auth:** NextAuth with Google OAuth

### Key Features
- **URL Ingestion:** `backend/libs/web_ingester.py` - scrape web pages
- **Transforms:** `POST /api/v1/chat/transform` - summarize, extract, map
- **AI Assistant:** Floating action button with context-aware suggestions

---

## REPO STRUCTURE

```
TeachAssist/
├── CLAUDE.md           # This file (AI execution guide)
├── README.md           # Quick start
├── app/                # Next.js pages
├── backend/            # FastAPI backend
├── components/         # React components
├── docs/               # All documentation
│   ├── STATUS.md
│   ├── PRD.md
│   ├── MASTER_PLAN.md
│   ├── API_SPEC.md
│   └── ...
├── personas/           # Inner Council YAML
├── stores/             # Zustand stores
└── services/           # Frontend services
```

---

## RELATED PROJECTS

| Project | Path | Purpose |
|---------|------|---------|
| **CC4** | `/Users/danielconnolly/Projects/CC4` | Source of proven components |
| **TeachAssist** | `/Users/danielconnolly/Projects/TeachAssist` | Teacher OS pilot |

---

**Ready to deploy? See `docs/MASTER_PLAN.md` for deployment steps.**
