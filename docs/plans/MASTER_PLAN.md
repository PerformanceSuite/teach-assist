# TeachAssist Master Execution Plan

> **Status:** Ready for execution
> **Execution Method:** Git worktrees + Claude Code CLI
> **Target:** Transform v0.1 scaffold into functional Teacher OS pilot

---

## Overview

This plan transforms TeachAssist from a UI scaffold into a functional AI-powered teacher assistant by integrating proven components from CC4:

| Component | Source | Purpose |
|-----------|--------|---------|
| KnowledgeBeast | CC4/backend/libs/knowledgebeast | Notebook Mode RAG |
| Persona Store | CC4/backend/libs/persona_store.py | Inner Council |
| Persona YAML | CC4/backend/libs/personas/*.yaml | Advisor templates |

**Estimated Scope:** 5 batches, ~40 tasks

---

## Batch A: Foundation & Backend Setup

**Goal:** Establish Python backend infrastructure alongside Next.js frontend.

### Phase 0: Environment Setup

- [ ] **0.1** Initialize git repo and push scaffold to GitHub
  ```bash
  cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle
  git init && git branch -M main
  git remote add origin https://github.com/PerformanceSuite/teach-assist.git
  git add -A && git commit -m "TeachAssist v0.1 scaffold"
  git push -u origin main
  ```

- [ ] **0.2** Create worktree structure
  ```bash
  mkdir -p TeachAssist-worktrees
  git worktree add TeachAssist-worktrees/wt-backend -b feature/backend-setup
  git worktree add TeachAssist-worktrees/wt-frontend -b feature/frontend-integration
  ```

- [ ] **0.3** Verify Python environment (3.11+ required for KnowledgeBeast)
  ```bash
  python3 --version  # Must be 3.11+
  ```

- [ ] **0.4** Create backend directory structure in wt-backend
  ```
  backend/
  ├── api/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── deps.py
  │   └── routers/
  │       ├── __init__.py
  │       ├── sources.py
  │       ├── chat.py
  │       ├── council.py
  │       ├── grading.py
  │       └── health.py
  ├── libs/
  │   ├── __init__.py
  │   └── knowledgebeast/  (copy from CC4)
  ├── personas/
  │   ├── standards-guardian.yaml
  │   ├── pedagogy-coach.yaml
  │   ├── equity-advocate.yaml
  │   └── time-optimizer.yaml
  ├── data/
  │   └── .gitkeep
  ├── tests/
  │   └── __init__.py
  ├── requirements.txt
  ├── pyproject.toml
  └── .env.example
  ```

### Phase 1: KnowledgeBeast Integration

- [ ] **1.1** Copy KnowledgeBeast from CC4
  ```bash
  cp -r /Users/danielconnolly/Projects/CC4/backend/libs/knowledgebeast \
        ./backend/libs/
  ```

- [ ] **1.2** Copy persona_store.py from CC4
  ```bash
  cp /Users/danielconnolly/Projects/CC4/backend/libs/persona_store.py \
     ./backend/libs/
  ```

- [ ] **1.3** Create requirements.txt with dependencies
  ```
  fastapi>=0.109.0
  uvicorn[standard]>=0.27.0
  python-multipart>=0.0.6
  pydantic>=2.5.0
  pydantic-settings>=2.1.0
  httpx>=0.26.0
  structlog>=24.1.0
  PyYAML>=6.0
  python-dotenv>=1.0.0

  # KnowledgeBeast dependencies
  chromadb>=0.4.22
  sentence-transformers>=2.2.2
  pypdf>=3.17.0
  python-docx>=1.1.0
  tiktoken>=0.5.2
  ```

- [ ] **1.4** Create pyproject.toml
- [ ] **1.5** Create backend/.env.example
- [ ] **1.6** Create virtual environment and install dependencies
  ```bash
  cd backend
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  ```

- [ ] **1.7** Verify KnowledgeBeast imports work
  ```bash
  python -c "from libs.knowledgebeast import HybridQueryEngine; print('OK')"
  ```

### Phase 2: Core API Layer

- [ ] **2.1** Create `api/main.py` (FastAPI app)
- [ ] **2.2** Create `api/deps.py` (dependency injection)
- [ ] **2.3** Create `api/routers/health.py` (health check endpoint)
- [ ] **2.4** Create `api/routers/sources.py` (document ingestion)
- [ ] **2.5** Create `api/routers/chat.py` (grounded RAG chat)
- [ ] **2.6** Create `api/routers/council.py` (Inner Council advisors)
- [ ] **2.7** Run backend and verify health endpoint
  ```bash
  uvicorn api.main:app --reload --port 8002
  curl http://localhost:8002/health
  ```

- [ ] **2.8** Commit and push backend branch
  ```bash
  git add -A
  git commit -m "feat: Add Python backend with KnowledgeBeast integration"
  git push -u origin feature/backend-setup
  ```

**Batch A Exit Criteria:**
- [ ] Backend starts without errors
- [ ] Health endpoint returns OK
- [ ] KnowledgeBeast imports work
- [ ] Personas load from YAML

---

## Batch B: Inner Council Personas

**Goal:** Create teacher-specific advisory personas.

### Phase 3: Persona Creation

- [ ] **3.1** Create `personas/standards-guardian.yaml`
- [ ] **3.2** Create `personas/pedagogy-coach.yaml`
- [ ] **3.3** Create `personas/equity-advocate.yaml`
- [ ] **3.4** Create `personas/time-optimizer.yaml`
- [ ] **3.5** Create `personas/_index.yaml` (manifest)
- [ ] **3.6** Test persona loading via API
  ```bash
  curl http://localhost:8002/api/v1/council/personas
  ```

- [ ] **3.7** Create Council chat endpoint test
  ```bash
  curl -X POST http://localhost:8002/api/v1/council/consult \
    -H "Content-Type: application/json" \
    -d '{"persona": "standards-guardian", "context": "Lesson on forces", "question": "Am I addressing MS-PS2-1?"}'
  ```

- [ ] **3.8** Commit personas
  ```bash
  git add personas/
  git commit -m "feat: Add Inner Council advisor personas"
  ```

**Batch B Exit Criteria:**
- [ ] All 4 personas load
- [ ] Council consult endpoint returns structured advice
- [ ] Personas follow the advisory-only constraint

---

## Batch C: Frontend Integration (wt-frontend)

**Goal:** Connect Next.js frontend to Python backend.

### Phase 4: API Client Setup

- [ ] **4.1** Create `lib/api.ts` (API client for backend)
- [ ] **4.2** Create `lib/stores/notebookStore.ts` (Zustand store)
- [ ] **4.3** Create `lib/stores/councilStore.ts` (Inner Council state)
- [ ] **4.4** Update `next.config.mjs` for API proxy to backend

### Phase 5: Notebook Mode UI

- [ ] **5.1** Create `components/notebook/SourceUploader.tsx`
- [ ] **5.2** Create `components/notebook/SourceList.tsx`
- [ ] **5.3** Create `components/notebook/ChatPanel.tsx`
- [ ] **5.4** Create `components/notebook/CitationBadge.tsx`
- [ ] **5.5** Update `app/app/notebook/page.tsx` with real UI
- [ ] **5.6** Test: Upload PDF, ask question, see cited answer

### Phase 6: Inner Council UI

- [ ] **6.1** Create `components/council/AdvisorCard.tsx`
- [ ] **6.2** Create `components/council/CouncilPanel.tsx`
- [ ] **6.3** Create `components/council/AdviceDisplay.tsx`
- [ ] **6.4** Add Council sidebar to relevant pages (Plan, Grade)
- [ ] **6.5** Test: Toggle advisor, get structured advice

- [ ] **6.6** Commit frontend changes
  ```bash
  git add -A
  git commit -m "feat: Notebook Mode + Inner Council frontend"
  git push -u origin feature/frontend-integration
  ```

**Batch C Exit Criteria:**
- [ ] Notebook Mode: upload sources, grounded chat works
- [ ] Inner Council: toggle advisors, get structured advice
- [ ] Frontend builds without errors

---

## Batch D: Grade Studio & Workflows

**Goal:** Implement batch grading workflow.

### Phase 7: Grade Studio Backend

- [ ] **7.1** Create `api/routers/grading.py`
  - Rubric upload/storage
  - Work intake (pseudonymous)
  - Clustering by feedback pattern
  - Narrative comment generation

- [ ] **7.2** Create `api/models/grading.py` (Pydantic schemas)
- [ ] **7.3** Create grading prompt templates
- [ ] **7.4** Test batch clustering endpoint

### Phase 8: Grade Studio Frontend

- [ ] **8.1** Create `components/grade/RubricEditor.tsx`
- [ ] **8.2** Create `components/grade/WorkUploader.tsx`
- [ ] **8.3** Create `components/grade/FeedbackCluster.tsx`
- [ ] **8.4** Create `components/grade/CommentEditor.tsx`
- [ ] **8.5** Create `components/grade/ExportPanel.tsx`
- [ ] **8.6** Update `app/app/grade/page.tsx`
- [ ] **8.7** Test full workflow: rubric → upload → cluster → draft → approve → export

**Batch D Exit Criteria:**
- [ ] Can upload rubric and student work
- [ ] Work clusters by feedback pattern
- [ ] Draft comments appear for teacher review
- [ ] Export to CSV works

---

## Batch E: Plan Studio & Sunday Rescue

**Goal:** Complete the pilot feature set.

### Phase 9: Plan Studio

- [ ] **9.1** Create `api/routers/planning.py`
- [ ] **9.2** Create UbD workflow prompts (GRASPS, etc.)
- [ ] **9.3** Create `components/plan/UbDWizard.tsx`
- [ ] **9.4** Create `components/plan/WeekPlanner.tsx`
- [ ] **9.5** Update `app/app/plan/page.tsx`

### Phase 10: Sunday Rescue Mode

- [ ] **10.1** Create `app/app/rescue/page.tsx` (guided flow)
- [ ] **10.2** Wire Grade Batch into rescue flow
- [ ] **10.3** Wire Plan Tuesday into rescue flow
- [ ] **10.4** Add rescue entry point to Today dashboard
- [ ] **10.5** End-to-end test: full Sunday Rescue workflow

### Phase 11: Polish & Merge

- [ ] **11.1** Run full test suite
- [ ] **11.2** Fix any build errors
- [ ] **11.3** Create PRs for both branches
- [ ] **11.4** Review and merge to main
- [ ] **11.5** Deploy to Vercel (frontend) + backend host

**Batch E Exit Criteria:**
- [ ] Sunday Rescue Mode works end-to-end
- [ ] Plan Studio creates UbD-aligned lessons
- [ ] All PRs merged to main
- [ ] Deployed and accessible

---

## Worktree Management

### Setup Commands

```bash
# From TeachAssist repo root
git worktree add ../TeachAssist-worktrees/wt-backend -b feature/backend-setup
git worktree add ../TeachAssist-worktrees/wt-frontend -b feature/frontend-integration
```

### Daily Workflow

```bash
# Backend work
cd ../TeachAssist-worktrees/wt-backend
source backend/.venv/bin/activate
# ... make changes ...
git add -A && git commit -m "feat: description"
git push

# Frontend work
cd ../TeachAssist-worktrees/wt-frontend
npm run dev
# ... make changes ...
git add -A && git commit -m "feat: description"
git push
```

### PR Flow

```bash
# Create PRs when batch is complete
gh pr create --base main --head feature/backend-setup \
  --title "Backend: KnowledgeBeast + Inner Council" \
  --body "Adds Python backend with RAG and advisory personas"

gh pr create --base main --head feature/frontend-integration \
  --title "Frontend: Notebook Mode + Council UI" \
  --body "Connects frontend to backend, implements core UIs"
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/api/main.py` | FastAPI application entry |
| `backend/api/routers/sources.py` | Document ingestion endpoints |
| `backend/api/routers/chat.py` | Grounded RAG chat |
| `backend/api/routers/council.py` | Inner Council advisors |
| `backend/personas/*.yaml` | Advisory persona definitions |
| `frontend/lib/api.ts` | Backend API client |
| `frontend/lib/stores/*.ts` | Zustand state stores |
| `frontend/components/notebook/*` | Notebook Mode components |
| `frontend/components/council/*` | Inner Council components |

---

## Success Criteria (Pilot)

- [ ] Teacher can upload sources and get grounded answers
- [ ] Inner Council provides structured advisory feedback
- [ ] Batch grading produces human-feeling narrative comments
- [ ] Sunday Rescue Mode saves multiple hours per weekend
- [ ] Ethical guardrails remain intact (no AI grading, no auto-send)
