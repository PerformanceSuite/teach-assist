# TeachAssist Master Plan

> **Single source of truth for project execution**
>
> Version: 2.1 | Last Updated: 2026-01-30 | Status: Ready for Pilot

---

## Current Status

| Component | Status | Completion |
|-----------|--------|------------|
| Backend API | ✅ Complete | 100% |
| Knowledge Service | ✅ Complete | 100% |
| **URL Ingestion** | ✅ Complete | 100% |
| **Source Transforms** | ✅ Complete | 100% |
| Inner Council (4 personas) | ✅ Complete | 100% |
| Frontend UI | ✅ Complete | 95% |
| Welcome Dashboard | ✅ Complete | 100% |
| **AI Assistant** | ✅ Complete | 100% |
| **Help Center** (15+ articles) | ✅ Complete | 100% |
| Keyboard Shortcuts | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| **Overall v0.1** | **✅ Complete** | **98%** |

### Recent Updates (2026-01-30)

**Feature Branch Merge Complete:**
- Merged `feature/url-ingestion` - Web page scraping (+744 lines)
- Merged `feature/source-transforms` - Summarize, extract, map standards (+594 lines)
- Merged `feature/ai-assistant` - FAB with animations and suggestions (+222 lines)

**Repository Cleanup:**
- Deleted 9 local + 2 remote feature branches
- Removed 4 worktrees
- Moved documentation to `docs/` per repo hygiene standards

---

## Pre-Deployment Checklist

### Critical Items

- [ ] **1. Verify API key configuration**
  ```bash
  cd backend
  cat .env  # Should have ANTHROPIC_API_KEY=sk-ant-...
  ```

- [ ] **2. Test backend health**
  ```bash
  source .venv/bin/activate
  uvicorn api.main:app --reload --port 8002
  curl http://localhost:8002/health
  # Expected: {"status":"healthy",...}
  ```

- [ ] **3. Test frontend build**
  ```bash
  npm run build
  # Should complete with no errors
  ```

- [ ] **4. Verify end-to-end flow**
  - [ ] Upload a test document
  - [ ] Ask a question (get grounded answer)
  - [ ] Consult Inner Council
  - [ ] Test keyboard shortcuts (Cmd+/, Cmd+.)

### Recommended Items

- [ ] **5. Add PWA icons** (currently placeholders)
  ```bash
  # Generate icons from 512x512 source
  cd public/icons
  # Add icon-192x192.png, icon-512x512.png
  ```

- [ ] **6. Update GitHub repository**
  ```bash
  git add -A
  git commit -m "docs: Add SPEC.md and consolidated MASTER_PLAN.md"
  git push origin main
  ```

- [ ] **7. Set up error monitoring** (optional)
  - Sentry or LogRocket for frontend
  - Structured logging for backend

---

## Deployment Steps

### Option A: Quick Deploy (Development/Testing)

**Step 1: Deploy Backend to Fly.io**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Navigate to backend
cd backend

# Login and create app
fly auth login
fly launch --name teachassist-api

# Set secrets
fly secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy
fly deploy

# Get URL
fly info
# Note: https://teachassist-api.fly.dev
```

**Step 2: Deploy Frontend to Vercel**

```bash
# Via GitHub (recommended)
# 1. Push to GitHub
# 2. Go to vercel.com/new
# 3. Import teach-assist repository
# 4. Add environment variable:
#    NEXT_PUBLIC_API_URL = https://teachassist-api.fly.dev
# 5. Deploy

# Or via CLI
npm install -g vercel
vercel login
vercel --prod
# When prompted, set NEXT_PUBLIC_API_URL
```

**Step 3: Verify Deployment**

```bash
# Test backend
curl https://teachassist-api.fly.dev/health

# Test frontend
# Visit https://teach-assist.vercel.app
# Upload a document, ask a question
```

### Option B: Local Testing (No Cloud)

```bash
# Terminal 1: Backend
cd backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Terminal 2: Frontend
npm run dev

# Open http://localhost:3000
```

---

## Outstanding Tasks by Priority

### P0: Deployment Blockers (None)

All critical features complete. Ready to deploy.

### P1: Before Pilot Launch

| Task | Status | Owner |
|------|--------|-------|
| Deploy backend to Fly.io | 🔲 Todo | DevOps |
| Deploy frontend to Vercel | 🔲 Todo | DevOps |
| Configure environment variables | 🔲 Todo | DevOps |
| Test with real curriculum PDFs | 🔲 Todo | QA |
| Recruit 3-5 pilot teachers | 🔲 Todo | PM |
| Send pilot setup guide | 🔲 Todo | PM |

### P2: During Pilot

| Task | Status | Owner |
|------|--------|-------|
| Monitor API costs (Anthropic dashboard) | 🔲 Todo | DevOps |
| Collect teacher feedback | 🔲 Todo | PM |
| Fix bugs reported by pilots | 🔲 Todo | Dev |
| Track usage patterns | 🔲 Todo | Analytics |

### P3: Post-Pilot (v0.2 Prep)

| Task | Status | Owner |
|------|--------|-------|
| Design Grade Studio UI | 🔲 Todo | Design |
| Implement batch grading API | 🔲 Todo | Backend |
| Add Google OAuth | 🔲 Todo | Auth |
| Implement Plan Studio | 🔲 Todo | Full Stack |

---

## v0.2 Roadmap

### Features

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| **Grade Studio** | High | 2-3 days | Not started |
| **Plan Studio** | High | 2-3 days | Not started |
| **Google OAuth** | Medium | 1 day | Not started |
| **Conversation History** | Medium | 1 day | Not started |
| **Sunday Rescue Mode** | Low | 2 days | Not started |

### Grade Studio Details

**Endpoints to implement:**
- `POST /api/v1/grading/rubrics` - Create rubric
- `POST /api/v1/grading/batch` - Submit student work
- `GET /api/v1/grading/batch/{id}` - Get clustered results
- `PUT /api/v1/grading/batch/{id}/comments` - Approve comments
- `GET /api/v1/grading/batch/{id}/export` - Export CSV

**UI Components:**
- RubricEditor.tsx
- WorkUploader.tsx
- FeedbackCluster.tsx
- CommentEditor.tsx
- ExportPanel.tsx

### Plan Studio Details

**UbD Workflow:**
1. Define transfer goals
2. Design performance task (GRASPS)
3. Plan learning sequence
4. Add formative checks
5. Generate materials

---

## Documentation Structure

### Root Level Files (per repo hygiene)

| File | Purpose | Status |
|------|---------|--------|
| README.md | Quick start guide | ✅ Complete |
| CLAUDE.md | AI agent instructions | ✅ Complete |

### docs/ Directory

| File | Purpose | Status |
|------|---------|--------|
| STATUS.md | Current progress | ✅ Complete |
| PRD.md | Product requirements | ✅ Complete |
| MASTER_PLAN.md | This file | ✅ Complete |
| SPEC.md | Vision & northstar | ✅ Complete |
| API_SPEC.md | API endpoint reference | ✅ Complete |
| ARCHITECTURE.md | Technical architecture | ✅ Complete |
| DEPLOYMENT.md | OAuth deployment | ✅ Complete |
| PILOT_SETUP_GUIDE.md | Teacher setup | ✅ Complete |
| DEPLOYMENT_QUICK_START.md | Quick deploy guide | ✅ Complete |
| VERCEL_DEPLOYMENT.md | Vercel-specific setup | ✅ Complete |

---

## Quick Reference

### Start Development

```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Frontend (new terminal)
npm run dev

# Open http://localhost:3000
```

### Key URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Local | http://localhost:3000 | http://localhost:8002 |
| Production | https://teach-assist.vercel.app | https://teachassist-api.fly.dev |

### Key Files

| Purpose | Path |
|---------|------|
| Backend entry | backend/api/main.py |
| Knowledge service | backend/libs/knowledge_service.py |
| Personas | personas/*.yaml |
| Frontend pages | app/*/page.tsx |
| API client | lib/api.ts |
| State stores | stores/*.ts |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+J | Go to Chat |
| Cmd+U | Upload Source |
| Cmd+Shift+C | Inner Council |
| Cmd+. | AI Assistant |
| Cmd+/ | Help Center |
| Cmd+1-4 | Navigate pages |
| Esc | Close panels |

---

## Success Metrics

### Pilot Phase (2-4 weeks)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Pilot teachers onboarded | 3-5 | Count |
| Documents uploaded | 10+ per teacher | API logs |
| Questions asked | 20+ per teacher | API logs |
| Council consultations | 5+ per teacher | API logs |
| Time saved (self-reported) | "Some" or more | Survey |
| NPS | 30+ | Survey |

### Production Phase (v1.0)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Monthly active users | 100+ | Analytics |
| 30-day retention | 60%+ | Cohort analysis |
| Documents per user | 10+ average | Database |
| API cost per user | < $5/month | Anthropic dashboard |

---

## Contact & Support

### For Pilot Teachers
- Setup guide: [PILOT_SETUP_GUIDE.md](./PILOT_SETUP_GUIDE.md)
- In-app help: Press Cmd+/
- Issues: GitHub Issues

### For Developers
- Spec: [SPEC.md](./SPEC.md)
- PRD: [PRD.md](./PRD.md)
- API docs: [API_SPEC.md](./API_SPEC.md)

---

**This is the single source of truth for TeachAssist execution.**

*Last updated: 2026-01-30*
