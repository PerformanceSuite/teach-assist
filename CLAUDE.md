# CLAUDE.md - TeachAssist Autonomous Execution

> **This file guides autonomous execution via Claude Code CLI**

---

## CURRENT MISSION

**Build TeachAssist: Teacher OS Pilot**

**Execution Method:** Claude Code CLI + Git Worktrees
**Plan:** `docs/plans/MASTER_PLAN.md`
**Current Batch:** A (Foundation & Backend Setup)
**Current Phase:** 0 (Environment Setup)

---

## EXECUTION PROTOCOL

### Starting a Session

1. Read this file (CLAUDE.md)
2. Read `docs/plans/MASTER_PLAN.md`
3. Check current batch and phase below
4. Execute the next incomplete task
5. Update this file with progress

### During Execution

- Complete ONE task at a time
- Run tests after code changes
- Commit after each completed task
- Update the "Current State" section below

### Before Stopping

- Commit all changes in worktrees
- Push to feature branches
- Update "Current State" below
- Note any blockers or issues

---

## CURRENT STATE

```
Batch: A (Foundation & Backend Setup)
Phase: 0 (Environment Setup)
Task:  0.1 (Initialize git repo)
Status: READY TO START

Last Updated: 2026-01-24
Last Session: Initial setup
```

### Completed Tasks

**Pre-work (this session):**
- [x] Created MASTER_PLAN.md
- [x] Created Inner Council personas (4 YAML files)
- [x] Created API_SPEC.md
- [x] Created backend scaffolding
- [x] Created persona_store.py

### In Progress
- [ ] Initialize git repo and push to GitHub

### Blockers
None

---

## BATCH OVERVIEW

| Batch | Name | Status | Description |
|-------|------|--------|-------------|
| A | Foundation & Backend Setup | **CURRENT** | Git, worktrees, KnowledgeBeast integration |
| B | Inner Council Personas | PENDING | Test and refine advisory personas |
| C | Frontend Integration | PENDING | Connect Next.js to Python backend |
| D | Grade Studio & Workflows | PENDING | Batch grading implementation |
| E | Plan Studio & Sunday Rescue | PENDING | Complete pilot feature set |

---

## KEY PATHS

| Purpose | Path |
|---------|------|
| Main repo | `/Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle` |
| Backend worktree | `../TeachAssist-worktrees/wt-backend` |
| Frontend worktree | `../TeachAssist-worktrees/wt-frontend` |
| Execution plan | `docs/plans/MASTER_PLAN.md` |
| Personas | `personas/*.yaml` |
| Backend | `backend/` |
| KnowledgeBeast source | `/Users/danielconnolly/Projects/CC4/backend/libs/knowledgebeast` |

---

## QUICK COMMANDS

### Git Setup (First Time)

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle
git init
git branch -M main
git remote add origin https://github.com/PerformanceSuite/teach-assist.git
git add -A
git commit -m "TeachAssist v0.1 scaffold with backend + personas"
git push -u origin main
```

### Worktree Setup

```bash
# Create worktrees directory (sibling to main repo)
mkdir -p /Users/danielconnolly/Projects/TeachAssist/TeachAssist-worktrees

# Create worktrees
git worktree add ../TeachAssist-worktrees/wt-backend -b feature/backend-setup
git worktree add ../TeachAssist-worktrees/wt-frontend -b feature/frontend-integration
```

### Backend Development

```bash
# Setup (first time)
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run backend
uvicorn api.main:app --reload --port 8002

# Test health
curl http://localhost:8002/health
```

### Frontend Development

```bash
# Run frontend
npm run dev

# Build
npm run build
```

### Copy KnowledgeBeast from CC4

```bash
cp -r /Users/danielconnolly/Projects/CC4/backend/libs/knowledgebeast \
      /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/backend/libs/
```

---

## INTEGRATION NOTES

### From CC4

Components to copy/adapt:
- `backend/libs/knowledgebeast/` - Full RAG system
- `backend/libs/persona_store.py` - Already adapted (done)
- Zustand patterns from frontend

### TeachAssist Constraints (Non-Negotiable)

- No AI grading (drafts only, teacher approves)
- No student surveillance
- Teacher retains full authority
- Minimal PII storage
- Pseudonymous student identifiers

---

## SESSION LOG

### Session 0 (2026-01-24)
- **Tasks:** Initial planning and scaffolding
- **Created:**
  - `docs/plans/MASTER_PLAN.md` - 5-batch execution plan
  - `docs/API_SPEC.md` - Full API specification
  - `personas/*.yaml` - 4 Inner Council advisors
  - `backend/` - Complete FastAPI scaffolding
  - `CLAUDE.md` - This file
- **Status:** Ready for Batch A execution
- **Next:** Initialize git, create worktrees, integrate KnowledgeBeast

---

## TROUBLESHOOTING

### Backend Won't Start
```bash
# Check Python version (need 3.11+)
python3 --version

# Check virtual environment
which python
# Should show .venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt
```

### Persona Loading Fails
```bash
# Check personas directory exists
ls -la personas/

# Check YAML syntax
python -c "import yaml; yaml.safe_load(open('personas/standards-guardian.yaml'))"
```

### KnowledgeBeast Import Error
```bash
# Ensure it's in the right place
ls -la backend/libs/knowledgebeast/

# Check for missing dependencies
pip install chromadb sentence-transformers
```

---

## SUCCESS CRITERIA

Pilot is successful if:
- [ ] Teacher can upload sources and get grounded answers
- [ ] Inner Council provides structured advisory feedback
- [ ] Batch grading produces human-feeling narrative comments
- [ ] Sunday Rescue Mode saves multiple hours per weekend
- [ ] Ethical guardrails remain intact
