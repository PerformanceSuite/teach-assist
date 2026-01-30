# TeachAssist v0.1 Pilot - Completion Plan

> **Goal:** Ship v0.1 to pilot users (shanie@wildvine.com, shanieh@comcast.net)
> **Created:** 2026-01-30
> **Updated:** 2026-01-30
> **Status:** Code complete, ready for deployment

---

## Executive Summary

| Task | Status | Notes |
|------|--------|-------|
| Narratives UI | ✅ Done | Merged from feature branch |
| Light/Dark Theme | ✅ Done | System/Light/Dark toggle |
| OAuth Allowlist | ✅ Done | TEACHASSIST_ALLOWED_EMAILS env var |
| Auth Protection | ✅ Done | All routes protected |
| Deploy Backend | 🔲 Ready | Railway or Render (free tier) |
| Deploy Frontend | 🔲 Ready | Vercel |
| End-to-end Test | 🔲 Pending | After deployment |

**Code is complete. Deployment steps below.**

---

## Phase 1: Cleanup (10 min)

The nested `TeachAssist-narratives-ui/` folder inside the main repo is stale and causing build errors.

```bash
# Remove the stale nested folder (it's a copy, not needed)
rm -rf /Users/danielconnolly/Projects/TeachAssist/TeachAssist-narratives-ui

# Verify git status
git status
```

---

## Phase 2: Narratives UI Implementation (2-3 hours)

### Worktree Strategy

Create a fresh worktree for the narratives feature:

```bash
cd /Users/danielconnolly/Projects/TeachAssist

# Create feature branch and worktree
git branch feature/narratives-ui-v2
git worktree add ../TeachAssist-narratives /Users/danielconnolly/Projects/TeachAssist feature/narratives-ui-v2
```

### Components to Build

```
app/narratives/
  page.tsx                    # Main route

components/Narratives/
  index.tsx                   # Exports
  NarrativesWizard.tsx        # 5-step wizard container
  ClassSetupStep.tsx          # Step 1: Class name, semester, rubric
  StudentDataStep.tsx         # Step 2: Add students, scores, observations
  GenerateStep.tsx            # Step 3: Tone, Council review, generate
  ReviewStep.tsx              # Step 4: Edit, approve narratives
  ExportStep.tsx              # Step 5: TXT/CSV/JSON export
  NarrativeCard.tsx           # Individual narrative display/edit

stores/
  narrativesStore.ts          # Zustand store for wizard state
```

### API Integration

Backend endpoints (already implemented):
- `POST /api/v1/narratives/synthesize` - Generate 1-10 narratives
- `POST /api/v1/narratives/batch` - Batch processing (10+)
- `GET /api/v1/narratives/batch/{id}` - Check status
- `PUT /api/v1/narratives/batch/{id}/edit` - Edit drafts
- `GET /api/v1/narratives/batch/{id}/export` - Export CSV/TXT/JSON

### Update GlobalLayout.tsx

Add Narratives to navigation:

```typescript
import { FileText } from 'lucide-react'

const navItems = [
  // ... existing items
  { href: '/narratives', label: 'Narratives', icon: FileText },
]
```

### Update middleware.ts

Protect the narratives route:

```typescript
export const config = {
  matcher: ["/app/:path*", "/narratives/:path*"],
};
```

---

## Phase 3: OAuth Email Allowlist (15 min)

### Already Implemented

The allowlist logic exists in `lib/auth.ts`:

```typescript
const allowedEmails = parseAllowlist(process.env.TEACHASSIST_ALLOWED_EMAILS);

callbacks: {
  async signIn({ user }) {
    const email = (user.email ?? "").toLowerCase();
    if (allowedEmails.size === 0) return true; // Dev convenience
    return allowedEmails.has(email);
  },
}
```

### Configuration Required

**Local (.env.local):**
```
TEACHASSIST_ALLOWED_EMAILS=shanie@wildvine.com,shanieh@comcast.net
```

**Vercel (Environment Variables):**
```
TEACHASSIST_ALLOWED_EMAILS=shanie@wildvine.com,shanieh@comcast.net
```

---

## Phase 4: Backend Deployment

> **Update (2026-01-30):** Backend now uses OpenAI embeddings API instead of local ML models.
> This makes it serverless-compatible and deployable to Vercel, Railway, or Render.

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select the `teach-assist` repo
4. Set root directory to `backend`
5. Add environment variables:
   - `ANTHROPIC_API_KEY` = your key
   - `PORT` = 8002
6. Deploy and get URL (e.g., `https://teachassist-api.up.railway.app`)

### Option B: Render (Alternative Free Tier)

1. Go to [render.com](https://render.com)
2. Create new "Web Service" from GitHub
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
6. Add `ANTHROPIC_API_KEY` environment variable

### Update CORS (backend/api/config.py)

```python
cors_origins = [
    "https://teachassist.vercel.app",
    "https://teach-assist.vercel.app",
    "https://teachassist-*.vercel.app",  # Preview deployments
    "http://localhost:3000",
    "http://localhost:3001",
]
```

---

## Phase 5: Frontend Deployment - Vercel (30 min)

### Prerequisites
- GitHub repo pushed
- Google OAuth credentials
- Backend URL from Phase 4

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://teachassist.vercel.app/api/auth/callback/google` (prod)

### Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://teachassist-api.fly.dev` |
| `GOOGLE_CLIENT_ID` | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://teachassist.vercel.app` |
| `TEACHASSIST_ALLOWED_EMAILS` | `shanie@wildvine.com,shanieh@comcast.net` |

### Deploy Steps

1. Push to GitHub: `git push origin main`
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy

---

## Phase 6: End-to-End Testing (30 min)

### Authentication
- [ ] Visit app → redirected to sign-in
- [ ] Sign in with allowed email → success
- [ ] Sign in with non-allowed email → rejected

### Sources & Chat
- [ ] Upload PDF → appears in list
- [ ] Ask question → get cited answer
- [ ] Transform source → get summary

### Inner Council
- [ ] Select Standards Guardian
- [ ] Enter context and question
- [ ] Get structured response (observations, risks, suggestions, questions)

### Narratives (Primary Use Case)
- [ ] **Step 1:** Enter class "Science 6A", semester "Spring 2026"
- [ ] **Step 1:** Load IB MYP Science rubric
- [ ] **Step 2:** Add student "JD" with criteria scores
- [ ] **Step 2:** Add observations and notable work
- [ ] **Step 2:** Import 5 more students via CSV
- [ ] **Step 3:** Select "Warm" tone
- [ ] **Step 3:** Enable Equity Champion review (optional)
- [ ] **Step 3:** Click Generate → see progress bar
- [ ] **Step 4:** Review 6 generated narratives
- [ ] **Step 4:** Edit one narrative, save changes
- [ ] **Step 4:** Approve all narratives
- [ ] **Step 5:** Export to TXT (ISAMS format)
- [ ] **Step 5:** Copy all to clipboard

### PWA
- [ ] Install prompt appears on mobile
- [ ] Keyboard shortcuts work (Cmd+., Cmd+/)

---

## Worktree Commands Reference

```bash
# List worktrees
git worktree list

# Create worktree for feature
git worktree add ../TeachAssist-narratives feature/narratives-ui-v2

# Work in worktree
cd ../TeachAssist-narratives
# ... make changes, commit ...

# Merge back to main
cd /Users/danielconnolly/Projects/TeachAssist
git merge feature/narratives-ui-v2 --no-ff -m "feat(narratives): Complete Narratives UI wizard"

# Clean up worktree after merge
git worktree remove ../TeachAssist-narratives
git branch -d feature/narratives-ui-v2
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OAuth redirect mismatch | Test locally first, verify NEXTAUTH_URL |
| CORS errors on production | Update backend CORS before frontend deploy |
| Backend cold start latency | Set min_machines_running=1 on Fly.io |
| InMemoryVectorStore data loss | Document: data resets on server restart |
| Narratives timeout for large batches | Backend uses async batch for 10+ students |

---

## Success Criteria

v0.1 is complete when:
- [ ] Both pilot users can sign in
- [ ] Teacher can upload curriculum sources
- [ ] Teacher can ask grounded questions with citations
- [ ] Teacher can consult Inner Council advisors
- [ ] **Teacher can generate narrative comments for a class**
- [ ] **Teacher can export narratives to TXT for ISAMS**

---

## Post-Launch

1. Share URL with Shanie
2. Monitor Anthropic API usage
3. Collect feedback
4. Plan v0.2 features (Grade Studio, Plan Studio, Sunday Rescue)
