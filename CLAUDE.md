# CLAUDE.md - TeachAssist Execution Guide

> **This file guides autonomous execution via Claude Code CLI**
> **Last Updated:** 2026-01-26

---

## 🎯 CURRENT MISSION

**Build TeachAssist v0.1 Pilot** - Teacher OS with Knowledge Base + Inner Council

**Key Insight:** TeachAssist is a CC4 fork. Reuse proven components, adapt for teachers.

**Current Phase:** Frontend Integration (Backend ~85% complete)
**Status:** `docs/STATUS.md`

---

## 📊 PROGRESS SUMMARY

| Component | Status | Completion |
|-----------|--------|------------|
| Backend Foundation | ✅ Complete | 100% |
| Knowledge Service | ✅ Working | 100% |
| API Endpoints | ✅ Complete | 100% |
| Personas | ✅ Created | 100% |
| Frontend UX | 🔴 Not Started | 0% |
| End-to-End Testing | 🟡 Partial | 50% |
| **OVERALL** | **🟡 In Progress** | **35%** |

---

## ✅ COMPLETED (This Session: 2026-01-25)

### Backend Foundation - COMPLETE
- [x] **Resolved ChromaDB Issue** - Replaced with CC4's InMemoryVectorStore
- [x] **Knowledge Service** - Document ingestion + semantic search working
- [x] **FastAPI Backend** - All endpoints operational
- [x] **Dependencies Updated** - Removed chromadb, simplified requirements
- [x] **Configuration** - Added kb_* settings for compatibility

### Documentation
- [x] `docs/CC4_REUSE_GUIDE.md` - Component mapping from CC4
- [x] `docs/STATUS.md` - Detailed progress tracking

**Key Discovery:** CC4 uses InMemoryVectorStore (numpy-based), not ChromaDB!

---

## 🚀 NEXT STEPS (Priority Order)

### Immediate (Next 30 minutes)
1. **Commit current work**
   ```bash
   git add -A
   git commit -m "fix: Replace ChromaDB with InMemoryVectorStore + docs"
   git push origin main
   ```

2. **Test backend end-to-end** (see `docs/FINAL_PLAN.md` Phase 1.2)
   - Upload a real PDF
   - Search uploaded content
   - Consult Inner Council persona

### Short-term (Next 4-6 hours)
3. **Copy Welcome Dashboard from CC4** (Phase 2.2.A)
   - Copy `WelcomePage.tsx` → `app/page.tsx`
   - Copy `components/Welcome/*`
   - Adapt quick actions for teachers

4. **Copy AI Assistant sidebar** (Phase 2.2.B)
   - Copy `AIAssistant/*` components
   - Create teacher-specific suggestions

5. **Copy Help Center** (Phase 2.2.C)
   - Copy `HelpCenter/*` components
   - Write 15 teacher help articles

6. **Connect frontend to backend** (Phase 2.3)
   - Create `lib/api.ts` client
   - Test upload + search + chat flow

---

## 📂 KEY FILES

| Purpose | Path |
|---------|------|
| **Status** | `docs/STATUS.md` ⭐ |
| PRD | `PRD.md` |
| API Spec | `docs/API_SPEC.md` |
| Backend Entry | `backend/api/main.py` |
| Knowledge Service | `backend/libs/knowledge_service.py` |
| Personas | `personas/*.yaml` (4 files) |

---

## 🎨 CC4 COMPONENTS TO COPY

### From CC4's Recent Commit (9302664)

**Welcome Dashboard:**
```bash
cp /Users/danielconnolly/Projects/CC4/frontend/src/pages/WelcomePage.tsx app/page.tsx
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/Welcome components/
```

**AI Assistant:**
```bash
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/AIAssistant components/
cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/aiAssistantStore.ts stores/
cp /Users/danielconnolly/Projects/CC4/frontend/src/services/suggestionEngine.ts services/
```

**Help Center:**
```bash
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/HelpCenter components/
cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/helpStore.ts stores/
```

**Teacher Customizations Needed:**
- QuickStart actions → Upload sources, Ask questions, Consult Council
- AI suggestions → Route-specific teacher tips
- Help articles → 15 teacher-specific guides

---

## 🏃 QUICK START COMMANDS

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
# Install new dependencies
npm install zustand lucide-react react-markdown date-fns clsx tailwind-merge

# Run dev server
npm run dev
```

### Testing
```bash
# Test document upload
curl -X POST http://localhost:8002/api/v1/sources/upload \
  -F "file=@test.pdf" -F "title=Test Doc"

# Test search
curl -X POST http://localhost:8002/api/v1/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?"}'

# Test Inner Council
curl -X POST http://localhost:8002/api/v1/council/consult \
  -H "Content-Type: application/json" \
  -d '{"persona": "standards-guardian", "context": "Forces lesson", "question": "Standards alignment?"}'
```

---

## 🎯 SUCCESS CRITERIA (v0.1 Pilot)

**Goal:** Prove Knowledge Base + Inner Council concept works for teachers

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Upload curriculum sources | ✅ | 🔴 | 50% |
| Ask grounded questions | ✅ | 🔴 | 50% |
| Inner Council consultation | ✅ | 🔴 | 50% |
| Welcome Dashboard | N/A | 🟡 | 30% |
| Help Center | N/A | 🟡 | 30% |

**Pilot Complete When:**
- ✅ Teacher can upload sources and get grounded answers
- ✅ Inner Council provides structured advisory feedback
- ✅ Welcome Dashboard shows teacher-specific actions
- ✅ Help Center has searchable documentation

---

## 🚫 OUT OF SCOPE (v0.1)

These are future features, NOT in pilot:
- ❌ Batch grading (Grade Studio) → v0.2
- ❌ Lesson planning (Plan Studio) → v0.2
- ❌ Sunday Rescue Mode → v0.2
- ❌ Multi-user authentication → v0.2
- ❌ AI grading (always forbidden)

---

## 🔧 TROUBLESHOOTING

### Backend Won't Start
```bash
python3 --version  # Should be 3.11+
cd backend && source .venv/bin/activate
pip install -r requirements.txt
```

### ChromaDB Errors
**Fixed!** We replaced ChromaDB with InMemoryVectorStore. If you see chromadb errors, check that:
- `backend/requirements.txt` doesn't include chromadb
- `backend/libs/knowledge_service.py` uses InMemoryVectorStore
- `backend/api/deps.py` imports from `libs.knowledge_service`

### Frontend Not Connecting to Backend
```bash
# Check .env.local
NEXT_PUBLIC_API_URL=http://localhost:8002

# Check CORS in backend
# backend/api/config.py should have:
cors_origins = ["http://localhost:3000", ...]
```

---

## 📞 DECISION LOG

### Why InMemoryVectorStore instead of ChromaDB?
- **ChromaDB:** Pydantic v2 compatibility issues, complex dependency
- **InMemoryVectorStore:** Simple, proven in CC4, no dependencies
- **Decision:** Use InMemoryVectorStore for v0.1, migrate to pgvector in v0.2 if needed

### Why copy CC4 components instead of building custom?
- **Reason:** TeachAssist is a CC4 fork, proven UX patterns
- **Benefits:** Faster, consistent, battle-tested
- **Customization:** Adapt content/suggestions for teachers

### Git worktrees or main branch?
- **Decision:** Continue on `main` until frontend works
- **Reason:** Simpler, fewer moving parts during rapid development
- **Later:** Create feature branches for new features in v0.2

---

## 🎨 ARCHITECTURAL NOTES

### Backend Stack
- **Framework:** FastAPI
- **Knowledge:** InMemoryVectorStore (numpy + sentence-transformers)
- **Personas:** YAML files + PersonaStore
- **Storage:** File system (no database in v0.1)

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **State:** Zustand (copied from CC4)
- **UI:** Tailwind CSS + shadcn/ui components
- **Icons:** lucide-react

### CC4 → TeachAssist Mapping
- CC4 React pages → Next.js `app/*/page.tsx`
- CC4 components → `components/*` (copy directly)
- CC4 Zustand stores → `stores/*` (copy directly)
- CC4 hooks → `hooks/*` (copy directly)

---

## 📖 SESSION LOG

### Session 1 (2026-01-25)
**Duration:** ~3 hours
**Focus:** ChromaDB resolution + CC4 investigation

**Completed:**
- Investigated ChromaDB Pydantic v2 incompatibility
- Discovered CC4 uses InMemoryVectorStore
- Copied `knowledge_service.py` from CC4
- Removed ChromaDB dependency
- Updated backend configuration
- Tested document ingestion + search (working!)
- Created consolidated documentation (FINAL_PLAN.md, CC4_REUSE_GUIDE.md)

**Key Insight:** CC4 already solved this problem - don't use ChromaDB!

**Next Session:**
- Commit current work
- Copy Welcome Dashboard from CC4
- Copy AI Assistant sidebar
- Start frontend integration

---

## 🔗 RELATED PROJECTS

| Project | Path | Purpose |
|---------|------|---------|
| **CC4** | `/Users/danielconnolly/Projects/CC4` | Source of proven components |
| **TeachAssist** | `/Users/danielconnolly/Projects/TeachAssist` | Teacher OS pilot |

**Note:** Both are internal tools - reuse liberally!

---

**🚀 Ready to execute? Read `docs/FINAL_PLAN.md` for detailed next steps.**
