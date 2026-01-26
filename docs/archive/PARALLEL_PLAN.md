# TeachAssist Parallel Execution Plan
**Created:** 2026-01-25
**Strategy:** 4 worktrees + 4 specialized agents = 3-4 hour completion

---

## 🎯 Goal: Complete remaining 40% in parallel

### Current State
- ✅ Backend: 85% complete
- 🔴 Frontend: 0% complete
- 🟡 Testing: 50% complete
- **Overall: 35% complete**

### Target State (3-4 hours from now)
- ✅ Backend: 100% tested and working
- ✅ Frontend: 100% with CC4 components adapted
- ✅ Testing: 100% end-to-end flows verified
- **Overall: 100% complete → Ship v0.1**

---

## 📊 Worktree Structure

```
TeachAssist/                           # Main worktree (coordination)
├── ../TeachAssist-backend/            # Worktree 1: Backend testing
├── ../TeachAssist-welcome/            # Worktree 2: Welcome Dashboard
├── ../TeachAssist-assistant/          # Worktree 3: AI Assistant + Help
└── ../TeachAssist-pages/              # Worktree 4: Core pages + API client
```

---

## 🤖 Agent Assignments

### Agent 1: Backend Testing Specialist
**Worktree:** `feature/backend-testing`
**Time:** 1-2 hours
**Deliverables:**
- [ ] Test document upload with real PDF
- [ ] Test semantic search across uploaded docs
- [ ] Test all 4 Inner Council personas
- [ ] Fix any bugs found
- [ ] Document API usage examples
- [ ] Create `backend/TEST_RESULTS.md`

**Commands:**
```bash
cd ../TeachAssist-backend
source backend/.venv/bin/activate
uvicorn api.main:app --reload --port 8002
# Run all tests from FINAL_PLAN.md Phase 1.2
```

### Agent 2: Welcome Dashboard Specialist
**Worktree:** `feature/welcome-dashboard`
**Time:** 2-3 hours
**Deliverables:**
- [ ] Copy CC4 Welcome components
- [ ] Adapt for teacher-specific quick actions
- [ ] Copy recent activity hooks
- [ ] Update feature overview for TeachAssist
- [ ] Test responsive design
- [ ] Create `docs/WELCOME_DASHBOARD.md`

**Source Files (CC4):**
```
/Users/danielconnolly/Projects/CC4/frontend/src/pages/WelcomePage.tsx
/Users/danielconnolly/Projects/CC4/frontend/src/components/Welcome/
/Users/danielconnolly/Projects/CC4/frontend/src/hooks/useRecentActivity.ts
```

### Agent 3: AI Assistant + Help Center Specialist
**Worktree:** `feature/assistant-help`
**Time:** 2-3 hours
**Deliverables:**
- [ ] Copy CC4 AIAssistant components
- [ ] Copy CC4 HelpCenter components
- [ ] Create teacher-specific suggestionEngine
- [ ] Write 15 help articles (see FINAL_PLAN.md)
- [ ] Copy keyboard shortcuts hook
- [ ] Test Cmd+. and Cmd+/ shortcuts
- [ ] Create `docs/HELP_ARTICLES.md`

**Source Files (CC4):**
```
/Users/danielconnolly/Projects/CC4/frontend/src/components/AIAssistant/
/Users/danielconnolly/Projects/CC4/frontend/src/components/HelpCenter/
/Users/danielconnolly/Projects/CC4/frontend/src/stores/aiAssistantStore.ts
/Users/danielconnolly/Projects/CC4/frontend/src/stores/helpStore.ts
/Users/danielconnolly/Projects/CC4/frontend/src/services/suggestionEngine.ts
/Users/danielconnolly/Projects/CC4/frontend/src/hooks/useKeyboardShortcuts.ts
```

### Agent 4: Core Pages + API Integration Specialist
**Worktree:** `feature/core-pages`
**Time:** 2-3 hours
**Deliverables:**
- [ ] Create `lib/api.ts` backend client
- [ ] Create `app/sources/page.tsx` (upload UI)
- [ ] Create `app/chat/page.tsx` (grounded chat)
- [ ] Create `app/council/page.tsx` (Inner Council UI)
- [ ] Update `app/layout.tsx` (add shortcuts, assistant, help)
- [ ] Create Zustand store for sources
- [ ] Test all API connections
- [ ] Create `docs/API_CLIENT.md`

---

## 🔄 Execution Flow

### Phase 1: Setup Worktrees (5 min - YOU)
```bash
# Create worktrees from existing feature branches
git worktree add ../TeachAssist-backend feature/backend-testing || \
  git worktree add -b feature/backend-testing ../TeachAssist-backend main

git worktree add ../TeachAssist-welcome feature/welcome-dashboard || \
  git worktree add -b feature/welcome-dashboard ../TeachAssist-welcome main

git worktree add ../TeachAssist-assistant feature/assistant-help || \
  git worktree add -b feature/assistant-help ../TeachAssist-assistant main

git worktree add ../TeachAssist-pages feature/core-pages || \
  git worktree add -b feature/core-pages ../TeachAssist-pages main

# Verify
git worktree list
```

### Phase 2: Launch Agents (10 min - YOU)
```bash
# Launch 4 agents in parallel using Claude Code Task tool
# Each agent works in its assigned worktree
# Each agent has access to CC4 source at /Users/danielconnolly/Projects/CC4
```

### Phase 3: Agent Execution (3-4 hours - PARALLEL)
- All agents work simultaneously
- Agent 1 (backend) completes first (~1-2h)
- Agents 2,3,4 (frontend) complete around same time (~2-3h)
- Each agent commits to their feature branch

### Phase 4: Integration (30 min - YOU)
```bash
# Merge branches in dependency order
git checkout main

# 1. Backend first (no conflicts)
git merge feature/backend-testing

# 2. Welcome dashboard (just app/page.tsx + components)
git merge feature/welcome-dashboard

# 3. Assistant + Help (components, stores, services)
git merge feature/assistant-help

# 4. Core pages + API client (app pages, lib, more stores)
git merge feature/core-pages

# Resolve any conflicts (should be minimal - different files)
```

### Phase 5: Final Testing (30 min - YOU)
```bash
# Start backend
cd backend && source .venv/bin/activate
uvicorn api.main:app --reload --port 8002 &

# Start frontend
npm run dev

# Test end-to-end:
# 1. Visit Welcome Dashboard
# 2. Upload a document (app/sources)
# 3. Ask a question (app/chat)
# 4. Consult council (app/council)
# 5. Open AI Assistant (Cmd+.)
# 6. Open Help Center (Cmd+/)
# 7. Test all keyboard shortcuts
```

### Phase 6: Ship (15 min - YOU)
```bash
# Final commit
git add -A
git commit -m "feat: Complete v0.1 pilot with CC4 components

- Backend fully tested and working (Agent 1)
- Welcome Dashboard with teacher customizations (Agent 2)
- AI Assistant + Help Center with 15 articles (Agent 3)
- Core pages + API integration (Agent 4)

All components adapted from CC4 for teacher workflows.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main

# Clean up worktrees
git worktree remove ../TeachAssist-backend
git worktree remove ../TeachAssist-welcome
git worktree remove ../TeachAssist-assistant
git worktree remove ../TeachAssist-pages

# Delete feature branches (merged)
git branch -d feature/backend-testing feature/welcome-dashboard \
  feature/assistant-help feature/core-pages
```

---

## 📋 Dependencies Between Agents

```
Agent 1 (Backend)     → Independent (can finish first)
                        ↓
Agent 4 (API Client)  → Needs Agent 1's test results to verify endpoints
                        ↓
Agent 2 (Welcome)     → Needs Agent 4's API client for recent activity
Agent 3 (Assistant)   → Independent (just copying + writing docs)
```

**Mitigation:** Agent 4 starts with API client creation (doesn't need backend running), then connects after Agent 1 finishes.

---

## 🎯 Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| All 4 agents complete | 100% | Check each feature branch has commits |
| No merge conflicts | < 5 conflicts | Clean file separation by agent |
| End-to-end flow works | ✅ | Upload → Ask → Council → UI all functional |
| Wall-clock time saved | 4-8 hours | 3-4h parallel vs 8-12h sequential |

---

## 🚨 Fallback Plan

If parallel execution hits issues:
1. **Agent conflicts:** Reassign files to different agents
2. **Merge conflicts:** Use sequential merge with testing between each
3. **API mismatch:** Agent 1 documents API first, Agent 4 implements client

---

## 📞 Communication Protocol

Since agents work independently, use these coordination files:

```bash
# Agent 1 writes when backend is tested
echo "✅ Backend tested, API stable" > BACKEND_READY.txt

# Agent 4 waits for this before final API testing
while [ ! -f BACKEND_READY.txt ]; do sleep 30; done
```

---

## 🎓 Lessons for Future Parallel Builds

1. **Worktrees are perfect for parallel UI work** - Different components = no conflicts
2. **Backend testing should finish first** - Unblocks API integration
3. **Documentation agents can run anytime** - Pure content creation
4. **Final integration still needs human** - Verify UX coherence

---

**Ready to execute? Let's launch 4 agents and finish this in 3-4 hours!**
