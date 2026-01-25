# TeachAssist v0.1 - Final Execution Plan

**Date:** 2026-01-25
**Status:** Ready to Execute
**Approach:** Fork CC4 patterns, customize for teachers

---

## 🎯 Mission

Transform TeachAssist from Next.js scaffold → Functional Teacher OS Pilot by reusing proven CC4 components.

**Key Insight:** TeachAssist is a CC4 fork. Don't rebuild - adapt what works.

---

## ✅ What's Done (This Session)

### Backend Foundation - COMPLETE ✅
- [x] **ChromaDB Issue Resolved** - Replaced with CC4's InMemoryVectorStore
- [x] **Knowledge Service Working** - Document ingestion + semantic search tested
- [x] **FastAPI Backend Running** - All endpoints exist and start cleanly
- [x] **Personas Created** - 4 Inner Council YAML files ready
- [x] **API Scaffolding Complete** - `/sources`, `/chat`, `/council`, `/health`

### Documentation - COMPLETE ✅
- [x] Created `CC4_REUSE_GUIDE.md` - Complete component mapping
- [x] Created `STATUS.md` - Current state tracking
- [x] Updated `CHROMADB_COMPAT.md` - Solution documented
- [x] This file - Final consolidated plan

**Backend: 85% complete** - Just needs end-to-end testing

---

## 🚀 Remaining Work (3 Phases)

### Phase 1: Backend Polish & Testing (2-3 hours)

#### 1.1 Commit Current Work
```bash
git add -A
git commit -m "fix: Replace ChromaDB with InMemoryVectorStore + add CC4 reuse docs"
git push origin main
```

#### 1.2 End-to-End Backend Testing
- [ ] Test document upload with real PDF
  ```bash
  curl -X POST http://localhost:8002/api/v1/sources/upload \
    -F "file=@test.pdf" \
    -F "title=Test Document"
  ```
- [ ] Test semantic search
  ```bash
  curl -X POST http://localhost:8002/api/v1/chat/ask \
    -H "Content-Type: application/json" \
    -d '{"query": "What is the main topic?"}'
  ```
- [ ] Test Inner Council
  ```bash
  curl -X POST http://localhost:8002/api/v1/council/consult \
    -H "Content-Type: application/json" \
    -d '{"persona": "standards-guardian", "context": "Teaching forces", "question": "Am I meeting standards?"}'
  ```

#### 1.3 Fix Any Issues Found
- Document edge cases
- Add error handling if needed
- Verify all 4 personas work

**Exit Criteria:** All API endpoints work end-to-end

---

### Phase 2: Frontend UX (CC4 Components) (4-6 hours)

**Strategy:** Copy CC4's recent UX improvements (commit 9302664) and adapt for teachers.

#### 2.1 Install Dependencies
```bash
npm install zustand lucide-react react-markdown date-fns clsx tailwind-merge
```

#### 2.2 Copy Core Components from CC4

**A. Welcome Dashboard (Landing Page)**
```bash
# Copy from CC4
cp /Users/danielconnolly/Projects/CC4/frontend/src/pages/WelcomePage.tsx \
   app/page.tsx

cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/Welcome \
      components/

cp /Users/danielconnolly/Projects/CC4/frontend/src/hooks/useRecentActivity.ts \
   hooks/
```

**Adapt for Teachers:**
- [ ] Update `WelcomeHero.tsx` → "Welcome back, [Teacher Name]" with time-based greeting
- [ ] Update `QuickStartSection.tsx` → Teacher actions:
  - Upload curriculum sources
  - Ask a question about sources
  - Start grading session
  - Create lesson plan
  - Consult Inner Council
- [ ] Update `RecentActivitySection.tsx` → Show:
  - Recent chats with sources
  - Uploaded documents
  - Grading sessions
  - Council consultations
- [ ] Update `FeatureOverview.tsx` → Explain:
  - Inner Council (AI advisors)
  - Grade Studio (batch grading)
  - Sunday Rescue Mode (lesson planning)

**B. AI Assistant Sidebar (Cmd+.)**
```bash
# Copy from CC4
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/AIAssistant \
      components/

cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/aiAssistantStore.ts \
   stores/

cp /Users/danielconnolly/Projects/CC4/frontend/src/services/suggestionEngine.ts \
   services/
```

**Adapt for Teachers:**
- [ ] Create `services/suggestionEngine.ts` with teacher-specific suggestions:
  ```typescript
  const ROUTE_SUGGESTIONS = {
    '/': [
      { type: 'action', title: 'Upload curriculum standards', ... },
      { type: 'next-step', title: 'Try asking about your sources', ... }
    ],
    '/sources': [
      { type: 'insight', title: 'You have 3 uploaded documents', ... },
      { type: 'action', title: 'Upload lesson plans for comparison', ... }
    ],
    '/chat': [
      { type: 'reminder', title: 'Ask about alignment with standards', ... }
    ],
    '/grading': [
      { type: 'action', title: 'Upload assignments to grade', ... }
    ]
  }
  ```

**C. Help Center (Cmd+/)**
```bash
# Copy from CC4
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/HelpCenter \
      components/

cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/helpStore.ts \
   stores/
```

**Write Teacher Help Articles:**
- [ ] Create `data/helpContent.ts` with 15 articles:

  **Getting Started (3 articles)**
  - "Uploading Your First Document"
  - "Asking Grounded Questions"
  - "Meeting Your Inner Council"

  **Notebook Mode / Sources (3 articles)**
  - "What Documents Should I Upload?"
  - "Organizing Your Knowledge Base"
  - "Searching Across Multiple Sources"

  **Inner Council (3 articles)**
  - "How the Council Works"
  - "Choosing the Right Advisor"
  - "Understanding Council Advice"

  **Grading (3 articles)**
  - "Batch Grading Workflow"
  - "Reviewing AI Feedback Drafts"
  - "Maintaining Your Voice"

  **Privacy & Ethics (3 articles)**
  - "What Data Does TeachAssist Store?"
  - "Student Privacy Protections"
  - "Teacher Authority Principles"

**D. Keyboard Shortcuts**
```bash
# Copy from CC4
cp /Users/danielconnolly/Projects/CC4/frontend/src/hooks/useKeyboardShortcuts.ts \
   hooks/
```

**Add Teacher Shortcuts:**
- [ ] Update keyboard shortcuts:
  - `Cmd+K` → Command Palette
  - `Cmd+J` → Toggle Chat
  - `Cmd+/` → Help Center
  - `Cmd+.` → AI Assistant (Council suggestions)
  - `Cmd+G` → Grade Studio (NEW)
  - `Cmd+P` → Plan Studio (NEW)
  - `Cmd+U` → Upload Source (NEW)

**E. Shared UI Components**
```bash
# Copy from CC4
cp /Users/danielconnolly/Projects/CC4/frontend/src/components/ui/Tooltip.tsx \
   components/ui/
```

#### 2.3 Connect Frontend to Backend

**Create API Client:**
- [ ] Create `lib/api.ts`:
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

  export const api = {
    sources: {
      upload: (file: File, title: string) => { /* ... */ },
      list: () => { /* ... */ }
    },
    chat: {
      ask: (query: string) => { /* ... */ }
    },
    council: {
      consult: (persona: string, context: string, question: string) => { /* ... */ }
    }
  }
  ```

**Update Environment:**
- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8002
  NEXTAUTH_SECRET=[generate-secret]
  ```

#### 2.4 Build Core Pages

- [ ] Update `app/page.tsx` → Welcome Dashboard (already copied)
- [ ] Create `app/sources/page.tsx` → Document upload + list
- [ ] Create `app/chat/page.tsx` → Grounded chat interface
- [ ] Create `app/council/page.tsx` → Inner Council consultation
- [ ] Update `app/layout.tsx` → Add AI Assistant, Help Center, keyboard shortcuts

**Exit Criteria:**
- Welcome Dashboard loads with teacher-specific content
- AI Assistant shows contextual suggestions
- Help Center has searchable teacher docs
- All keyboard shortcuts work

---

### Phase 3: Integration & Polish (2-3 hours)

#### 3.1 End-to-End Testing
- [ ] Upload a curriculum document
- [ ] Ask questions about uploaded document
- [ ] Consult Standards Guardian about lesson plan
- [ ] Verify AI Assistant suggestions change by route
- [ ] Search Help Center for "grading"
- [ ] Test all keyboard shortcuts

#### 3.2 Teacher Customization
- [ ] Customize color theme for education (keep dark, adjust accent)
- [ ] Update favicon and metadata
- [ ] Add teacher-specific welcome message
- [ ] Customize error messages for teacher workflows

#### 3.3 Documentation
- [ ] Update README.md with setup instructions
- [ ] Add screenshots to help articles
- [ ] Document keyboard shortcuts in Help Center
- [ ] Create teacher onboarding flow (6 steps)

#### 3.4 Final Commit
```bash
git add -A
git commit -m "feat: Add Welcome Dashboard, AI Assistant, Help Center from CC4

- Copy Welcome Dashboard with teacher-specific quick actions
- Copy AI Assistant sidebar with context-aware suggestions
- Copy Help Center with 15 teacher help articles
- Add keyboard shortcuts (Cmd+K/J/.//)
- Connect frontend to Python backend API
- Add teacher customizations and branding

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main
```

**Exit Criteria:**
- ✅ Teacher can upload sources and get grounded answers
- ✅ Inner Council provides structured advisory feedback
- ✅ Welcome Dashboard shows teacher-specific actions
- ✅ AI Assistant shows contextual suggestions
- ✅ Help Center has searchable documentation

---

## 📊 Progress Tracker

| Phase | Status | Hours | Completion |
|-------|--------|-------|------------|
| Backend Foundation | ✅ Done | 4h | 100% |
| Phase 1: Backend Testing | 🔲 Todo | 2-3h | 0% |
| Phase 2: Frontend UX | 🔲 Todo | 4-6h | 0% |
| Phase 3: Integration | 🔲 Todo | 2-3h | 0% |
| **TOTAL** | **35% Done** | **12-16h** | **35%** |

---

## 🎯 Success Criteria (Pilot v0.1)

| Feature | Status | Notes |
|---------|--------|-------|
| Upload curriculum sources | 🟡 Backend ready | Need frontend UI |
| Ask grounded questions | 🟡 Backend ready | Need chat UI |
| Inner Council consultation | 🟡 Backend ready | Need council UI |
| Welcome Dashboard | 🔴 Not started | Copy from CC4 |
| AI Assistant suggestions | 🔴 Not started | Copy from CC4 |
| Help Center | 🔴 Not started | Write articles |
| Keyboard shortcuts | 🔴 Not started | Copy from CC4 |

**Overall: 35% complete** (Backend done, frontend pending)

---

## 🚫 Out of Scope (Future Versions)

These are NOT in v0.1 pilot:
- ❌ Batch grading (Grade Studio) → v0.2
- ❌ Lesson planning (Plan Studio) → v0.2
- ❌ Sunday Rescue Mode → v0.2
- ❌ Authentication/multi-user → v0.2
- ❌ Mobile app → Future
- ❌ AI grading (always forbidden)

**v0.1 Goal:** Prove the Notebook Mode + Inner Council concept works for teachers.

---

## 🎨 Design Principles

### From CC4 (Keep)
- Dark theme for reduced eye strain
- Clean, minimal interface
- Keyboard-first navigation
- Contextual help everywhere
- Proactive AI suggestions

### Teacher-Specific (Add)
- Education-friendly colors (indigo accent)
- Clear ethical boundaries (teacher authority)
- Student privacy indicators
- Simple, teacher-tested language
- Weekend-friendly workflows

---

## 📂 File Structure (After Phase 2)

```
TeachAssist-v0.1-bundle/
├── app/
│   ├── page.tsx                    # Welcome Dashboard (from CC4)
│   ├── sources/page.tsx            # Upload & manage documents
│   ├── chat/page.tsx               # Grounded Q&A
│   ├── council/page.tsx            # Inner Council
│   └── layout.tsx                  # + AI Assistant, Help Center, shortcuts
├── components/
│   ├── Welcome/                    # From CC4
│   ├── AIAssistant/                # From CC4
│   ├── HelpCenter/                 # From CC4
│   └── ui/                         # Shared components
├── stores/
│   ├── aiAssistantStore.ts         # From CC4
│   ├── helpStore.ts                # From CC4
│   └── sourcesStore.ts             # New (for uploads)
├── services/
│   ├── suggestionEngine.ts         # Adapted for teachers
│   └── api.ts                      # Backend client
├── hooks/
│   ├── useKeyboardShortcuts.ts     # From CC4
│   └── useRecentActivity.ts        # Adapted for teachers
├── data/
│   └── helpContent.ts              # 15 teacher articles
├── backend/
│   ├── api/                        # FastAPI app ✅
│   ├── libs/
│   │   ├── knowledge_service.py    # From CC4 ✅
│   │   └── persona_store.py        # ✅
│   └── personas/                   # 4 YAML files ✅
└── docs/
    ├── FINAL_PLAN.md               # This file
    ├── CC4_REUSE_GUIDE.md          # Component mapping
    └── STATUS.md                   # Progress tracking
```

---

## 🚀 Quick Start (Resume Work)

### Option A: Continue Backend Testing (30 min)
```bash
cd backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Test endpoints (see Phase 1.2)
```

### Option B: Start Frontend (4-6 hours)
```bash
# Install dependencies
npm install zustand lucide-react react-markdown date-fns clsx tailwind-merge

# Copy components from CC4 (see Phase 2.2)
# Adapt for teachers
# Connect to backend
```

### Option C: Full Testing (2-3 hours)
```bash
# Start backend
cd backend && source .venv/bin/activate
uvicorn api.main:app --reload --port 8002 &

# Start frontend
npm run dev

# Test end-to-end flow
```

---

## 📞 Decision Points

### Should we create git worktrees?
**Recommendation:** Not yet. Continue on `main` until frontend is working, then create feature branches for new features.

### Priority: Backend or Frontend?
**Recommendation:** Frontend next. Backend is 85% done. Completing frontend makes the pilot usable.

### Copy CC4 components or build custom?
**Recommendation:** Copy CC4. It's proven, saves time, and TeachAssist is meant to be a fork.

---

## 🎯 Next Session (Top Priority)

1. **Commit current work** (5 min)
2. **Copy Welcome Dashboard** (30 min)
3. **Copy AI Assistant** (30 min)
4. **Copy Help Center** (1 hour)
5. **Write 5 help articles** (1 hour)
6. **Test integration** (30 min)

**Goal:** Working Welcome Dashboard by end of next session.

---

**Last Updated:** 2026-01-25 01:45 AM
**Next Review:** After Phase 2 (Frontend) complete
