# Parallel Execution Plan - TeachAssist v0.1 Completion

> **Created:** 2026-01-30
> **Goal:** Complete remaining v0.1 features using parallel git worktrees

---

## Remaining Work Summary

| Task | Type | Complexity | Dependencies |
|------|------|------------|--------------|
| Source Transforms UI | Frontend | Medium | Backend ready |
| URL Ingestion | Backend + Frontend | Medium | None |
| Help Center Content | Content | Low | Components exist |
| AI Assistant Integration | Frontend | Low | Components exist |

**Estimated Total:** 4-6 hours of work, reducible to ~2 hours with parallelization

---

## Worktree Strategy

### Branch Structure

```
main (stable)
├── feature/source-transforms    → Worktree 1
├── feature/url-ingestion        → Worktree 2
├── feature/help-content         → Worktree 3
└── feature/ai-assistant         → Worktree 4
```

### Setup Commands

```bash
cd /Users/danielconnolly/Projects/TeachAssist

# Create worktrees
git worktree add ../TeachAssist-transforms feature/source-transforms -b feature/source-transforms
git worktree add ../TeachAssist-url feature/url-ingestion -b feature/url-ingestion
git worktree add ../TeachAssist-help feature/help-content -b feature/help-content
git worktree add ../TeachAssist-assistant feature/ai-assistant -b feature/ai-assistant
```

---

## Worktree 1: Source Transforms UI

**Branch:** `feature/source-transforms`
**Path:** `/Users/danielconnolly/Projects/TeachAssist-transforms`

### Scope
Add UI to trigger source transformations (summarize, extract misconceptions, map standards, etc.)

### Files to Create/Modify
- `components/Sources/TransformPanel.tsx` - Transform selection UI
- `components/Sources/TransformResult.tsx` - Display transform results
- `app/sources/page.tsx` - Add transform section
- `lib/api.ts` - Add `api.chat.transform()` method

### Backend Endpoint (Already Exists)
```
POST /api/v1/chat/transform
{
  "transform": "summarize" | "extract_misconceptions" | "map_standards" | "generate_questions" | "simplify_language",
  "source_ids": ["src_123"],
  "options": { "audience": "students", "length": "short" }
}
```

### Acceptance Criteria
- [ ] User can select a source and choose a transform type
- [ ] Transform results display in a modal or panel
- [ ] Results can be copied to clipboard
- [ ] Loading state while transform runs

---

## Worktree 2: URL Ingestion

**Branch:** `feature/url-ingestion`
**Path:** `/Users/danielconnolly/Projects/TeachAssist-url`

### Scope
Implement URL/webpage ingestion to add web content to knowledge base

### Files to Create/Modify
- `backend/api/routers/sources.py` - Implement `POST /sources/url` endpoint
- `backend/libs/web_ingester.py` - New: fetch and parse web content
- `components/Sources/UrlUploader.tsx` - New: URL input component
- `app/sources/page.tsx` - Add URL upload section
- `lib/api.ts` - Add `api.sources.uploadUrl()` method

### Backend Implementation
```python
# backend/libs/web_ingester.py
import httpx
from bs4 import BeautifulSoup

async def fetch_and_parse(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        # Extract title, main content
        return {
            "title": soup.title.string if soup.title else url,
            "content": soup.get_text(separator="\n", strip=True),
            "url": url
        }
```

### Dependencies to Add
```
# backend/requirements.txt
httpx>=0.25.0
beautifulsoup4>=4.12.0
```

### Acceptance Criteria
- [ ] User can paste a URL and click "Add"
- [ ] Web page content is fetched, parsed, and indexed
- [ ] Source appears in list with URL as title
- [ ] Error handling for invalid URLs, timeouts

---

## Worktree 3: Help Center Content

**Branch:** `feature/help-content`
**Path:** `/Users/danielconnolly/Projects/TeachAssist-help`

### Scope
Write 15 teacher-specific help articles for the Help Center

### Files to Create/Modify
- `content/help/*.md` - 15 markdown help articles
- `lib/helpArticles.ts` - Article index and loader
- `components/HelpCenter/HelpCenter.tsx` - Wire up articles

### Article List (15 Total)

**Getting Started (3)**
1. `welcome.md` - Welcome to TeachAssist
2. `quick-start.md` - Quick Start Guide
3. `privacy-first.md` - Privacy-First Design (FERPA/COPPA)

**Knowledge Base (4)**
4. `uploading-sources.md` - Uploading Curriculum Sources
5. `asking-questions.md` - Asking Grounded Questions
6. `understanding-citations.md` - Understanding Citations
7. `source-transforms.md` - Using Source Transforms

**Inner Council (3)**
8. `inner-council-intro.md` - Meet Your Advisory Council
9. `choosing-advisors.md` - Choosing the Right Advisor
10. `interpreting-advice.md` - Interpreting Advisory Feedback

**Narrative Synthesis (3)**
11. `narrative-overview.md` - Narrative Comment Synthesis
12. `entering-student-data.md` - Entering Student Data (FERPA-safe)
13. `reviewing-narratives.md` - Reviewing and Editing Narratives

**Reference (2)**
14. `ib-criteria.md` - IB MYP Science Criteria Reference
15. `keyboard-shortcuts.md` - Keyboard Shortcuts

### Acceptance Criteria
- [ ] All 15 articles written in markdown
- [ ] Articles load in Help Center sidebar
- [ ] Search/filter works across articles
- [ ] Links between related articles

---

## Worktree 4: AI Assistant Integration

**Branch:** `feature/ai-assistant`
**Path:** `/Users/danielconnolly/Projects/TeachAssist-assistant`

### Scope
Integrate existing AI Assistant components into the main layout

### Files to Create/Modify
- `components/GlobalLayout.tsx` - Add assistant toggle button
- `components/AIAssistant/AIAssistantSidebar.tsx` - Polish existing component
- `stores/aiAssistantStore.ts` - Ensure state management works
- `app/layout.tsx` - Include assistant in root layout

### Features
- Floating action button to open assistant
- Slide-in sidebar from right
- Context-aware suggestions based on current page
- Quick actions (upload source, ask question, consult council)

### Acceptance Criteria
- [ ] FAB visible on all pages
- [ ] Sidebar slides in when clicked
- [ ] Suggestions update based on current route
- [ ] Can trigger actions from sidebar

---

## Execution Order

### Phase 1: Setup (5 min)
```bash
# Create all worktrees
git worktree add ../TeachAssist-transforms feature/source-transforms -b feature/source-transforms
git worktree add ../TeachAssist-url feature/url-ingestion -b feature/url-ingestion
git worktree add ../TeachAssist-help feature/help-content -b feature/help-content
git worktree add ../TeachAssist-assistant feature/ai-assistant -b feature/ai-assistant
```

### Phase 2: Parallel Development
Run 4 Claude agents in parallel, one per worktree:

| Agent | Worktree | Task |
|-------|----------|------|
| Agent 1 | TeachAssist-transforms | Source Transforms UI |
| Agent 2 | TeachAssist-url | URL Ingestion |
| Agent 3 | TeachAssist-help | Help Center Content |
| Agent 4 | TeachAssist-assistant | AI Assistant Integration |

### Phase 3: Integration (15 min)
```bash
# Merge all branches back to main
cd /Users/danielconnolly/Projects/TeachAssist
git checkout main
git merge feature/source-transforms --no-ff -m "feat: Add source transforms UI"
git merge feature/url-ingestion --no-ff -m "feat: Implement URL ingestion"
git merge feature/help-content --no-ff -m "docs: Add 15 help center articles"
git merge feature/ai-assistant --no-ff -m "feat: Integrate AI assistant sidebar"
```

### Phase 4: Cleanup
```bash
# Remove worktrees
git worktree remove ../TeachAssist-transforms
git worktree remove ../TeachAssist-url
git worktree remove ../TeachAssist-help
git worktree remove ../TeachAssist-assistant

# Delete feature branches
git branch -d feature/source-transforms
git branch -d feature/url-ingestion
git branch -d feature/help-content
git branch -d feature/ai-assistant
```

---

## Risk Mitigation

### Potential Conflicts
- `lib/api.ts` - Modified by worktrees 1, 2. Solution: Merge transforms first, then URL.
- `app/sources/page.tsx` - Modified by worktrees 1, 2. Solution: Same as above.

### Merge Order (to minimize conflicts)
1. `feature/help-content` (no code conflicts)
2. `feature/ai-assistant` (separate files)
3. `feature/source-transforms` (sources page)
4. `feature/url-ingestion` (sources page, api.ts)

---

## Success Criteria

After all merges, v0.1 pilot should have:
- [x] Knowledge Base upload + search ✅
- [x] Grounded Chat with citations ✅
- [x] Inner Council advisory ✅
- [x] Narrative Comment Synthesis ✅
- [x] Welcome Dashboard ✅
- [ ] Source Transforms UI
- [ ] URL Ingestion
- [ ] Help Center with 15 articles
- [ ] AI Assistant sidebar

**Target:** v0.1 pilot ready for teacher testing
