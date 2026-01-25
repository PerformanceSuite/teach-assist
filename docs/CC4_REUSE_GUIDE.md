# CC4 → TeachAssist Reuse Guide

**Source:** `/Users/danielconnolly/Projects/CC4`
**Target:** `/Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle`

TeachAssist is a fork of CC4, adapted for teacher workflows. This guide maps what to copy/adapt from CC4.

---

## Critical Discovery: ChromaDB Solution

**CC4 doesn't use ChromaDB** - it uses `InMemoryVectorStore` instead!

### ✅ Solution Applied to TeachAssist

**File:** `backend/api/__init__.py`
- Added Pydantic v2 monkey-patch for ChromaDB compatibility
- Fixes `BaseSettings` import issue
- Server now starts successfully

**Next Step:** Replace ChromaDB with CC4's `InMemoryVectorStore` approach:
- Copy: `/CC4/backend/app/services/knowledge_service.py` → TeachAssist
- Benefits: No ChromaDB dependency, simpler, proven to work

---

## 🎨 Frontend Architecture

### Key Difference
- **CC4:** React + Vite (`frontend/src/`)
- **TeachAssist:** Next.js 14 App Router (`app/`)

### Adaptation Strategy
Convert CC4's React components to Next.js:
- CC4 pages → TeachAssist `app/*/page.tsx`
- CC4 components → TeachAssist `components/*`
- CC4 stores (Zustand) → Copy directly (works in Next.js)
- CC4 hooks → Copy directly

---

## 📋 Components to Copy (Recent UX Improvements)

### 1. Welcome Dashboard (Commit: 9302664)

**From CC4:**
```
frontend/src/pages/WelcomePage.tsx
frontend/src/components/Welcome/
  ├── WelcomeHero.tsx
  ├── QuickStartSection.tsx
  ├── RecentActivitySection.tsx
  └── FeatureOverview.tsx
frontend/src/hooks/useRecentActivity.ts
```

**Adapt to TeachAssist:**
```
app/page.tsx (default landing)
components/Welcome/
  ├── WelcomeHero.tsx
  ├── QuickStartSection.tsx
  ├── RecentActivitySection.tsx
  └── FeatureOverview.tsx
hooks/useRecentActivity.ts
```

**Customize for Teachers:**
- QuickStart actions: Upload sources, Ask question, Create lesson plan, Start grading
- Recent activity: Recent chats, uploaded documents, grading sessions
- Feature overview: Inner Council, Grade Studio, Sunday Rescue Mode

---

### 2. AI Assistant Sidebar (Cmd+.)

**From CC4:**
```
frontend/src/components/AIAssistant/index.tsx
frontend/src/stores/aiAssistantStore.ts
frontend/src/services/suggestionEngine.ts
```

**Adapt to TeachAssist:**
```
components/AIAssistant/index.tsx
stores/aiAssistantStore.ts
services/suggestionEngine.ts
```

**Customize Suggestions for Teachers:**
- Route-specific tips for `/chat`, `/sources`, `/grading`, `/planning`
- Proactive reminders: "You have 15 ungraded assignments"
- Insights: "Your most-used persona is Standards Guardian"
- Actions: "Upload curriculum standards", "Create rubric"

---

### 3. Help Center (Cmd+/)

**From CC4:**
```
frontend/src/components/HelpCenter/
  ├── index.tsx
  └── ContextualTip.tsx
frontend/src/stores/helpStore.ts
frontend/src/data/helpContent.ts (12 articles, 6 categories)
```

**Adapt to TeachAssist:**
```
components/HelpCenter/
  ├── index.tsx
  └── ContextualTip.tsx
stores/helpStore.ts
data/helpContent.ts
```

**Teacher-Specific Help Articles:**
1. **Getting Started**
   - Uploading your first document
   - Asking grounded questions
   - Understanding Inner Council
2. **Grading**
   - Batch grading workflow
   - Using rubrics effectively
   - Reviewing AI-generated feedback
3. **Lesson Planning**
   - Sunday Rescue Mode
   - UbD framework in TeachAssist
4. **Sources**
   - Curriculum standards
   - Student IEPs/504 plans
   - Prior lesson plans
5. **Privacy & Ethics**
   - What data is stored
   - How student privacy is protected
   - Teacher authority principles

---

### 4. Shared UI Components

**From CC4:**
```
frontend/src/components/ui/
  ├── Tooltip.tsx (NEW - commit 9302664)
  ├── Button.tsx
  ├── Input.tsx
  ├── Modal.tsx
  └── ... (other shadcn/ui components)
```

**Copy to TeachAssist:**
```
components/ui/
  ├── Tooltip.tsx
  ├── Button.tsx
  ├── Input.tsx
  └── Modal.tsx
```

---

### 5. Keyboard Shortcuts

**CC4 Shortcuts (from commit 9302664):**
- `Cmd+K`: Command Palette
- `Cmd+J`: Toggle Chat
- `Cmd+/`: Help Center
- `Cmd+.`: AI Assistant

**TeachAssist Shortcuts:**
- `Cmd+K`: Command Palette
- `Cmd+J`: Toggle Chat
- `Cmd+/`: Help Center
- `Cmd+.`: AI Assistant (Inner Council suggestions)
- `Cmd+G`: Grade Studio (new)
- `Cmd+P`: Lesson Planning (new)

**Implementation:**
Copy CC4's keyboard shortcut hook:
```
frontend/src/hooks/useKeyboardShortcuts.ts → hooks/useKeyboardShortcuts.ts
```

---

## 🗄️ Backend Services to Copy

### 1. Knowledge Service (In-Memory Vector Store)

**From CC4:**
```
backend/app/services/knowledge_service.py
```

**Features:**
- `InMemoryVectorStore` (numpy-based cosine similarity)
- `KnowledgeService` singleton
- Hybrid search (vector + keyword)
- Per-project isolation
- No ChromaDB dependency!

**Copy to TeachAssist:**
```
backend/libs/knowledge_service.py
```

**Replace:**
- Current: `api/deps.py` tries to use KnowledgeBeast with ChromaDB
- New: Use CC4's `InMemoryVectorStore` approach

---

### 2. Persona Store

**Already copied!** ✅
- `backend/libs/persona_store.py` (based on CC4's implementation)

---

## 🎯 Zustand Stores (State Management)

### Copy These Stores from CC4

**From CC4:**
```
frontend/src/stores/
  ├── aiAssistantStore.ts (NEW)
  ├── helpStore.ts (NEW)
  ├── onboardingStore.ts (updated)
  ├── chatStore.ts
  ├── intelligenceStore.ts (for feed)
  └── projectsStore.ts
```

**Adapt to TeachAssist:**
```
stores/
  ├── aiAssistantStore.ts
  ├── helpStore.ts
  ├── onboardingStore.ts
  ├── chatStore.ts
  ├── councilStore.ts (renamed from intelligenceStore)
  └── sourcesStore.ts (renamed from projectsStore)
```

---

## 📊 Data Files to Adapt

### Help Content

**From CC4:**
```typescript
// frontend/src/data/helpContent.ts
export const HELP_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', icon: 'Rocket' },
  { id: 'strategic', name: 'Strategic Planning', icon: 'Map' },
  // ...
]

export const HELP_ARTICLES = [
  {
    id: 'first-goal',
    categoryId: 'getting-started',
    title: 'Creating Your First Goal',
    content: '...',
    keywords: ['goal', 'canvas', 'strategic']
  },
  // 12 total articles
]
```

**Adapt to TeachAssist:**
```typescript
// data/helpContent.ts
export const HELP_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', icon: 'Rocket' },
  { id: 'grading', name: 'Grading', icon: 'CheckSquare' },
  { id: 'planning', name: 'Lesson Planning', icon: 'Calendar' },
  { id: 'sources', name: 'Sources', icon: 'FileText' },
  { id: 'council', name: 'Inner Council', icon: 'Users' },
  { id: 'privacy', name: 'Privacy & Ethics', icon: 'Shield' },
]

export const HELP_ARTICLES = [
  // 15+ teacher-specific articles
]
```

---

### Suggestion Engine Rules

**From CC4:**
```typescript
// frontend/src/services/suggestionEngine.ts
const ROUTE_SUGGESTIONS: Record<string, Suggestion[]> = {
  '/': [...welcome suggestions...],
  '/canvas': [...canvas tips...],
  '/strategic': [...strategic suggestions...],
  '/ventures': [...venture tips...],
}
```

**Adapt to TeachAssist:**
```typescript
// services/suggestionEngine.ts
const ROUTE_SUGGESTIONS: Record<string, Suggestion[]> = {
  '/': [...welcome suggestions...],
  '/chat': [...chat tips...],
  '/sources': [...source management tips...],
  '/grading': [...grading workflow suggestions...],
  '/planning': [...lesson planning tips...],
}
```

---

## 🎨 Styling & Theme

### CC4 Uses Custom Design System

**From CC4's `tailwind.config.ts`:**
```typescript
colors: {
  'cc-bg': '#0a0b0d',        // Main background
  'cc-surface': '#12141a',   // Card/panel background
  'cc-border': '#1e2028',    // Borders
  'cc-text': '#e5e5e5',      // Primary text
  'cc-muted': '#8b8d98',     // Secondary text
}
```

**TeachAssist Theme (Teacher-Friendly):**
```typescript
colors: {
  'ta-bg': '#0a0b0d',           // Keep dark theme
  'ta-surface': '#12141a',
  'ta-border': '#1e2028',
  'ta-accent': '#6366f1',       // Indigo (education-friendly)
  'ta-success': '#10b981',      // Green (completed)
  'ta-warning': '#f59e0b',      // Orange (needs attention)
  'ta-danger': '#ef4444',       // Red (urgent)
}
```

---

## 🔧 Configuration Files to Copy

### 1. TypeScript Config

**From CC4:**
```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**TeachAssist Already Has:** ✅ Next.js-specific tsconfig

---

### 2. Package.json Dependencies

**From CC4 (relevant for TeachAssist):**
```json
{
  "dependencies": {
    "zustand": "^5.0.3",
    "lucide-react": "^0.468.0",
    "react-markdown": "^9.0.1",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  }
}
```

**Add to TeachAssist:**
```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle
npm install zustand lucide-react react-markdown date-fns clsx tailwind-merge
```

---

## 📝 Implementation Checklist

### Phase 1: Backend Knowledge Fix (30 min)
- [ ] Copy `CC4/backend/app/services/knowledge_service.py` → `backend/libs/knowledge_service.py`
- [ ] Update `backend/api/deps.py` to use `InMemoryVectorStore` instead of ChromaDB
- [ ] Test: `curl http://localhost:8002/health` - should return healthy
- [ ] Test: Upload document, query knowledge base

### Phase 2: Frontend Foundation (1 hour)
- [ ] Install dependencies: `zustand`, `lucide-react`, `react-markdown`
- [ ] Copy Zustand stores from CC4
- [ ] Copy `components/ui/` from CC4 (Tooltip, Button, etc.)
- [ ] Set up keyboard shortcuts hook

### Phase 3: Welcome Dashboard (1 hour)
- [ ] Copy Welcome components from CC4
- [ ] Adapt QuickStart actions for teachers
- [ ] Create `useRecentActivity` hook for TeachAssist
- [ ] Update `app/page.tsx` to use WelcomePage

### Phase 4: AI Assistant (1 hour)
- [ ] Copy AIAssistant component
- [ ] Copy `aiAssistantStore.ts`
- [ ] Create teacher-specific `suggestionEngine.ts`
- [ ] Add Cmd+. keyboard shortcut

### Phase 5: Help Center (1 hour)
- [ ] Copy HelpCenter component
- [ ] Copy `helpStore.ts`
- [ ] Write 15 teacher-specific help articles
- [ ] Add Cmd+/ keyboard shortcut
- [ ] Create ContextualTip component

### Phase 6: Integration Testing (30 min)
- [ ] Test all keyboard shortcuts
- [ ] Test AI Assistant on each route
- [ ] Test Help Center search
- [ ] Test Welcome Dashboard actions
- [ ] Verify mobile responsiveness

---

## 🚀 Quick Start Commands

### 1. Copy Knowledge Service
```bash
cp /Users/danielconnolly/Projects/CC4/backend/app/services/knowledge_service.py \
   /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/backend/libs/
```

### 2. Copy Frontend Components
```bash
# Welcome components
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/Welcome \
      /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/components/

# AI Assistant
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/AIAssistant \
      /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/components/

# Help Center
cp -r /Users/danielconnolly/Projects/CC4/frontend/src/components/HelpCenter \
      /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/components/

# UI Components
cp /Users/danielconnolly/Projects/CC4/frontend/src/components/ui/Tooltip.tsx \
   /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/components/ui/
```

### 3. Copy Stores
```bash
mkdir -p /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/stores

cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/aiAssistantStore.ts \
   /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/stores/

cp /Users/danielconnolly/Projects/CC4/frontend/src/stores/helpStore.ts \
   /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/stores/
```

### 4. Copy Services
```bash
mkdir -p /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/services

cp /Users/danielconnolly/Projects/CC4/frontend/src/services/suggestionEngine.ts \
   /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/services/
```

---

## 🎯 Success Criteria

TeachAssist successfully reuses CC4 patterns when:

1. **Backend Works**
   - ✅ Server starts without ChromaDB errors
   - ✅ Knowledge service ingests and searches documents
   - ✅ In-memory vector store performs semantic search

2. **Frontend Works**
   - ✅ Welcome Dashboard shows on `/` with teacher-specific quick actions
   - ✅ AI Assistant opens with `Cmd+.` and shows contextual suggestions
   - ✅ Help Center opens with `Cmd+/` and has searchable teacher docs
   - ✅ All Zustand stores work in Next.js App Router

3. **UX Improvements**
   - ✅ Keyboard shortcuts work (Cmd+K, Cmd+J, Cmd+/, Cmd+.)
   - ✅ Proactive suggestions appear based on route
   - ✅ Recent activity shows teacher-relevant actions
   - ✅ Onboarding flow adapted for teachers

---

## 🔄 Ongoing Sync

Since CC4 is actively developed, periodically check for new patterns:

```bash
cd /Users/danielconnolly/Projects/CC4
git log --oneline --since="1 week ago"
```

Look for commits with:
- "feat: Add" (new features to consider)
- "fix: UI" (UI improvements to port)
- "refactor:" (better patterns to adopt)

---

## 📞 Questions?

**Source Repo:** `/Users/danielconnolly/Projects/CC4`
**Target Repo:** `/Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle`

Both are your internal tools - reuse liberally! 🚀
