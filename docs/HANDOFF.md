# TeachAssist Developer Handoff Document

> **Last Updated:** 2026-01-29
> **Current Version:** v0.1 Pilot
> **Status:** Backend ~95% complete, Frontend ~30% complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Directory Structure](#directory-structure)
6. [Backend Architecture](#backend-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Styling & CSS](#styling--css)
9. [State Management](#state-management)
10. [API Client](#api-client)
11. [Authentication](#authentication)
12. [Data Flow](#data-flow)
13. [Personas System](#personas-system)
14. [Development Setup](#development-setup)
15. [Known Issues](#known-issues)
16. [Next Steps](#next-steps)

---

## Project Overview

**TeachAssist** is a teacher-first professional operating system that helps educators work with curriculum materials through grounded AI assistance and advisory personas.

### Core Features

1. **Knowledge Base** - Upload curriculum documents (PDF/DOCX/TXT), get grounded AI answers
2. **Inner Council** - Four AI advisory personas that review teaching plans
3. **Narratives API** - Generate semester narrative comments from student data

### Key Insight

TeachAssist is a fork of CC4 (CommandCenter 4). Many components were copied and adapted from that proven codebase.

### Pilot User

- IB Science teacher (grades 6-7), Washington State
- Primary use case: Transform semester data into narrative comments for ISAMS
- Privacy requirements: FERPA compliant (student initials only)

---

## Current Status

| Component | Status | Completion |
|-----------|--------|------------|
| Backend Foundation | ✅ Complete | 100% |
| Knowledge Service | ✅ Working | 100% |
| API Endpoints | ✅ Complete | 100% |
| Narratives API | ✅ Complete | 100% |
| Personas | ✅ Created | 100% |
| Frontend UX | 🟡 Partial | 30% |
| End-to-End Testing | 🟡 Partial | 60% |
| **OVERALL** | **🟡 In Progress** | **65%** |

### What's Working

**Backend:**
- Health check endpoint
- Sources API (upload, list, delete, preview, stats)
- Chat API (RAG with citations)
- Council API (persona consultation with structured parsing)
- Narratives API (semester comment synthesis)
- Knowledge Service (vector store, search, ingestion)
- Integration tests for all core flows

**Frontend:**
- Welcome Dashboard (partial)
- Sources Page (upload, list, stats)
- Chat Page (UI exists, needs integration)
- Council Page (UI exists, needs integration)
- Global Layout with keyboard shortcuts
- Shell Navigation
- Zustand state management

### Not Built (v0.2+)

- Grade Studio (batch grading)
- Plan Studio (UbD lesson builder)
- Sunday Rescue Mode
- Multi-user authentication
- Conversation persistence
- Analytics dashboard

---

## Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI** | Async Python web framework |
| **sentence-transformers** | Embedding generation (all-MiniLM-L6-v2) |
| **InMemoryVectorStore** | Custom numpy-based vector store |
| **Anthropic Claude** | LLM (Claude Sonnet 4) |
| **Pydantic 2** | Data validation and settings |
| **pypdf, python-docx** | Document parsing |
| **structlog** | Structured logging |

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | State management |
| **lucide-react** | Icons |
| **NextAuth 4** | Authentication |
| **@ducanh2912/next-pwa** | PWA support |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 15 (App Router) + Tailwind CSS + Zustand               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Welcome  │  │ Sources  │  │   Chat   │  │ Council  │        │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴──────┬──────┴─────────────┘                │
│                            │                                     │
│                     ┌──────┴──────┐                              │
│                     │  lib/api.ts │  Fetch-based API client      │
│                     └──────┬──────┘                              │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP /api/v1/*
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  FastAPI + Python 3.11                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routers                           │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐          │    │
│  │  │sources │ │  chat  │ │council │ │narratives│          │    │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └────┬─────┘          │    │
│  └──────┼──────────┼──────────┼───────────┼────────────────┘    │
│         │          │          │           │                      │
│         ▼          ▼          ▼           ▼                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Services Layer                        │    │
│  │  ┌─────────────────┐  ┌──────────────┐                  │    │
│  │  │KnowledgeService │  │ PersonaStore │                  │    │
│  │  │ (RAG Engine)    │  │ (YAML Load)  │                  │    │
│  │  └────────┬────────┘  └──────────────┘                  │    │
│  │           │                                              │    │
│  │           ▼                                              │    │
│  │  ┌─────────────────────────────────────┐                │    │
│  │  │      InMemoryVectorStore            │                │    │
│  │  │  (numpy cosine similarity)          │                │    │
│  │  └─────────────────────────────────────┘                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    External Services                     │    │
│  │  ┌──────────────────┐  ┌──────────────────────┐         │    │
│  │  │ Anthropic Claude │  │ sentence-transformers │         │    │
│  │  │   (LLM API)      │  │   (local embeddings)  │         │    │
│  │  └──────────────────┘  └──────────────────────┘         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FILE STORAGE                               │
│  /data/sources/ - Uploaded documents + metadata JSON            │
│  /personas/     - YAML persona definitions                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
TeachAssist/
├── app/                              # Next.js App Router pages
│   ├── page.tsx                     # Welcome dashboard (landing)
│   ├── layout.tsx                   # Root layout with metadata
│   ├── globals.css                  # Global styles (Tailwind)
│   ├── api/auth/[...nextauth]/      # NextAuth endpoints
│   ├── app/                         # Authenticated portal routes
│   │   ├── page.tsx                # "Today" home dashboard
│   │   ├── layout.tsx              # Portal shell layout
│   │   ├── notebook/page.tsx       # Knowledge Base mode
│   │   ├── grade/page.tsx          # Grade Studio (v0.2)
│   │   ├── plan/page.tsx           # Plan Studio (v0.2)
│   │   └── ...                     # Other stub pages
│   ├── sources/page.tsx            # Knowledge Base UI
│   ├── chat/page.tsx               # Grounded chat interface
│   └── council/page.tsx            # Inner Council interface
│
├── components/                       # React components
│   ├── GlobalLayout.tsx            # Client wrapper (keyboard shortcuts)
│   ├── Shell.tsx                   # Navigation shell
│   ├── Welcome/                    # Dashboard components
│   ├── Sources/                    # Document management UI
│   ├── notebook/                   # Chat components (legacy naming)
│   ├── HelpCenter/                 # Help documentation UI
│   └── AIAssistant/                # AI suggestion sidebar
│
├── stores/                          # Zustand state management
│   ├── sourcesStore.ts            # Knowledge base sources
│   ├── councilStore.ts            # Inner Council attention
│   ├── aiAssistantStore.ts        # AI Assistant visibility
│   ├── helpStore.ts               # Help Center state
│   └── onboardingStore.ts         # Onboarding progress
│
├── hooks/                           # React custom hooks
│   ├── useKeyboardShortcuts.ts    # Global shortcuts
│   └── useRecentActivity.ts       # Activity tracking
│
├── lib/                             # Utility libraries
│   ├── api.ts                     # Fetch-based API client
│   ├── auth.ts                    # NextAuth configuration
│   └── session.ts                 # Session helper
│
├── backend/                         # FastAPI Python backend
│   ├── api/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── config.py             # Pydantic settings
│   │   ├── deps.py               # Dependency injection
│   │   └── routers/              # API endpoints
│   │       ├── health.py
│   │       ├── sources.py        # Document CRUD
│   │       ├── chat.py           # RAG Q&A
│   │       ├── council.py        # Inner Council
│   │       └── narratives.py     # Narrative synthesis
│   ├── libs/
│   │   ├── knowledge_service.py  # KnowledgeBeast (RAG)
│   │   └── persona_store.py      # YAML persona loader
│   ├── personas/                 # Advisory persona YAMLs
│   ├── tests/                    # Integration tests
│   ├── data/                     # Runtime data
│   └── requirements.txt          # Python dependencies
│
├── docs/                           # Documentation
│   ├── STATUS.md                # Current progress
│   ├── API_SPEC.md              # Endpoint documentation
│   └── ...                      # Other docs
│
├── personas/                       # YAML persona files (root)
├── public/                         # Static assets
├── CLAUDE.md                      # AI agent instructions
├── package.json                   # Node.js dependencies
├── tailwind.config.ts            # Tailwind configuration
└── next.config.mjs               # Next.js configuration
```

---

## Backend Architecture

### Entry Point

**File:** `backend/api/main.py`

```python
app = FastAPI(title="TeachAssist API", lifespan=lifespan)

# CORS for frontend
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])

# Route registration
app.include_router(health.router, prefix="/api/v1/health")
app.include_router(sources.router, prefix="/api/v1/sources")
app.include_router(chat.router, prefix="/api/v1/chat")
app.include_router(council.router, prefix="/api/v1/council")
app.include_router(narratives.router, prefix="/api/v1/narratives")
```

### Configuration

**File:** `backend/api/config.py`

Key settings loaded from `.env` with `TA_` prefix:

```python
class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8002
    anthropic_api_key: str = ""
    kb_embedding_model: str = "all-MiniLM-L6-v2"
    kb_embedding_dim: int = 384
    sources_dir: Path = Path("./data/sources")
```

### Dependency Injection

**File:** `backend/api/deps.py`

Singleton pattern for lazy-loaded services:

```python
def get_persona_store() -> PersonaStore:
    # Returns shared PersonaStore instance

def get_knowledge_engine() -> KnowledgeService:
    # Returns shared KnowledgeService instance

def get_anthropic_client() -> Anthropic:
    # Returns Anthropic API client
```

### API Endpoints

| Router | Path | Purpose |
|--------|------|---------|
| `health.py` | `/api/v1/health` | Health checks |
| `sources.py` | `/api/v1/sources` | Document CRUD (upload, list, delete, preview) |
| `chat.py` | `/api/v1/chat` | RAG Q&A with citations |
| `council.py` | `/api/v1/council` | Inner Council persona consultation |
| `narratives.py` | `/api/v1/narratives` | Semester narrative generation |

### Knowledge Service (RAG Core)

**File:** `backend/libs/knowledge_service.py` (~900 lines)

**Key Components:**

1. **InMemoryVectorStore** - Custom numpy-based vector store
   - Thread-safe with RLock
   - Document storage: `Dict[doc_id] → {content, metadata}`
   - Embedding storage: `Dict[doc_id] → normalized np.ndarray`
   - Cosine similarity search

2. **KnowledgeService** - Main service class
   - `ingest(content, metadata)` - Parse, embed, store
   - `search(query, top_k, mode)` - Hybrid/vector/keyword search
   - `ask(query)` - RAG wrapper for LLM context
   - `delete(doc_id)` - Remove document
   - `get_stats()` - KB statistics

**Search Modes:**
- `vector` - Pure semantic similarity (cosine)
- `keyword` - Term matching
- `hybrid` - α × vector + (1-α) × keyword (default α=0.7)

### Persona Store

**File:** `backend/libs/persona_store.py`

- File-based YAML storage for advisory personas
- Each persona is a `.yaml` file in `personas/` directory

```python
class PersonaStore:
    def list(category=None) -> List[Persona]
    def get(name: str) -> Persona
    def save(persona: Persona) -> None
    def delete(name: str) -> None
```

---

## Frontend Architecture

### Next.js Configuration

**File:** `next.config.mjs`

```javascript
const nextConfig = {
  // PWA support
  ...withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  }),

  // API proxy in development
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8002/api/v1/:path*",
      },
    ];
  },
};
```

### Root Layout

**File:** `app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  );
}
```

### Global Layout (Client Component)

**File:** `components/GlobalLayout.tsx`

Handles:
- Keyboard shortcuts registration
- AIAssistant panel rendering
- HelpCenter panel rendering

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Cmd+.` / `Ctrl+.` | Toggle AI Assistant |
| `Cmd+/` / `Ctrl+/` | Toggle Help Center |
| `Cmd+U` / `Ctrl+U` | Go to Upload Sources |
| `Cmd+J` / `Ctrl+J` | Go to Chat |
| `Cmd+Shift+C` | Go to Inner Council |

### Page Structure

**Welcome Page** (`app/page.tsx`):
- Hero section with greeting
- Quick start actions (5 buttons)
- Recent activity feed
- Feature overview cards

**Sources Page** (`app/sources/page.tsx`):
- Dark theme (gray-950)
- SourceUploader (drag-drop)
- SourceStats display
- SourceList with documents

**Chat Page** (`app/chat/page.tsx`):
- Question input form
- Example questions
- ChatPanel for messages
- Citation display

**Council Page** (`app/council/page.tsx`):
- Persona selection grid
- Context input
- Question input
- Structured advice display

### Component Organization

```
components/
├── GlobalLayout.tsx      # Keyboard shortcuts + panels
├── Shell.tsx             # Navigation bar
├── Welcome/
│   ├── WelcomeHero.tsx
│   ├── QuickStartSection.tsx
│   ├── RecentActivitySection.tsx
│   └── FeatureOverview.tsx
├── Sources/
│   ├── SourceUploader.tsx  # Drag-drop upload
│   ├── SourceList.tsx      # Document list
│   └── SourceStats.tsx     # KB statistics
├── notebook/
│   └── ChatPanel.tsx       # Chat interface
├── HelpCenter/
│   ├── index.tsx           # Help panel
│   └── ContextualTip.tsx   # Route-based tips
└── AIAssistant/
    └── index.tsx           # AI suggestion sidebar
```

---

## Styling & CSS

### Tailwind CSS Configuration

**File:** `tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom extensions if any
    },
  },
  plugins: [],
};
```

### Global Styles

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Minimal custom styles - mostly Tailwind utilities */
```

### Design Patterns

**Color Scheme:**
- Primary backgrounds: `gray-950`, `gray-900`, `gray-800` (dark theme)
- Primary accent: `blue-600`, `blue-500` (buttons, links)
- Text: `white`, `gray-300`, `gray-400`
- Success: `green-500`
- Warning: `yellow-500`
- Error: `red-500`

**Common Utilities Used:**
```
bg-gray-950        # Page backgrounds
bg-gray-800        # Card backgrounds
rounded-lg         # Border radius
p-4, p-6           # Padding
gap-4, gap-6       # Grid/flex gaps
text-xl, text-sm   # Typography
font-semibold      # Font weight
hover:bg-gray-700  # Hover states
```

**Layout Patterns:**
```tsx
// Page container
<div className="min-h-screen bg-gray-950 text-white">
  <div className="max-w-4xl mx-auto px-4 py-8">
    {/* Content */}
  </div>
</div>

// Card
<div className="bg-gray-800 rounded-lg p-6">
  {/* Card content */}
</div>

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Grid items */}
</div>

// Button
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Common pattern: `grid-cols-1 md:grid-cols-2`

---

## State Management

### Zustand Stores

**sourcesStore.ts** - Knowledge Base state
```typescript
interface SourcesStore {
  sources: Source[]
  isLoading: boolean
  isUploading: boolean
  stats: KBStats | null

  fetchSources: () => Promise<void>
  uploadSource: (file: File, title?: string) => Promise<void>
  deleteSource: (id: string) => Promise<void>
  fetchStats: () => Promise<void>
}
```

**councilStore.ts** - Inner Council attention items
```typescript
interface CouncilStore {
  attentionItems: AttentionItem[]
  feedOpen: boolean

  addAttentionItem: (item: AttentionItem) => void
  markAsRead: (id: string) => void
  hasUnreadAttention: () => boolean
}
```

**aiAssistantStore.ts** - AI Assistant panel
```typescript
interface AIAssistantStore {
  isOpen: boolean
  context: RouteContext | null
  toggle: () => void
}
```

**helpStore.ts** - Help Center panel
```typescript
interface HelpStore {
  isOpen: boolean
  toggle: () => void
}
```

### Persistence

Stores use `zustand/middleware` for localStorage persistence:

```typescript
export const useSourcesStore = create<SourcesStore>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'sources-storage',
    }
  )
)
```

---

## API Client

**File:** `lib/api.ts` (~180 lines)

Fetch-based HTTP client with namespaced methods:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

export const api = {
  sources: {
    upload: async (file: File, title?: string) => {...},
    list: async () => {...},
    delete: async (sourceId: string) => {...},
    stats: async () => {...},
  },

  chat: {
    ask: async (query: string, options?: ChatOptions) => {...},
  },

  council: {
    listPersonas: async () => {...},
    consult: async (persona: string, context: string, question: string) => {...},
  },

  health: async () => {...},
}
```

**Response Type:**
```typescript
type ApiResponse<T> = {
  data: T | null
  error: string | null
}
```

---

## Authentication

### NextAuth Configuration

**File:** `lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      // Optional: Check against TEACHASSIST_ALLOWED_EMAILS
      const allowed = process.env.TEACHASSIST_ALLOWED_EMAILS
      if (!allowed) return true // Allow all in dev
      return allowed.split(',').includes(user.email!)
    },
  },
  session: {
    strategy: 'jwt',
  },
}
```

### Protected Routes

App routes under `/app/*` use the Shell component which checks session status.

---

## Data Flow

### Document Upload Flow

```
1. User drops file on SourceUploader
   ↓
2. Frontend: api.sources.upload(file, title)
   ↓ POST /api/v1/sources/upload (multipart/form-data)
3. Backend: sources.py router
   - Saves file to /data/sources/
   - Creates metadata JSON
   - Calls KnowledgeService.ingest()
   ↓
4. KnowledgeService:
   - Parses document (PDF/DOCX/TXT)
   - Chunks text (~500 tokens each)
   - Generates embeddings via sentence-transformers
   - Stores in InMemoryVectorStore
   ↓
5. Response: { source_id, filename, chunks_count }
   ↓
6. Frontend: Updates sourcesStore
```

### Chat (RAG) Flow

```
1. User submits question
   ↓ POST /api/v1/chat/message
2. Backend: chat.py router
   - Calls KnowledgeService.search(query, top_k=5)
   ↓
3. KnowledgeService:
   - Embeds query
   - Cosine similarity search
   - Returns top chunks with scores
   ↓
4. Backend builds Claude prompt:
   - System: "You are a helpful teacher assistant..."
   - Context: Retrieved chunks
   - User: Original question
   ↓
5. Anthropic API call
   ↓
6. Parse response, extract citations
   ↓
7. Response: { answer, citations, grounded: true/false }
```

### Council Consultation Flow

```
1. User selects persona + submits context/question
   ↓ POST /api/v1/council/consult
2. Backend: council.py router
   - Loads persona from PersonaStore
   - Builds user message with context
   ↓
3. For each selected persona:
   - Call Claude with persona's system_prompt
   - Parse structured response (Observations, Risks, etc.)
   ↓
4. Response: { advisors: [{ name, structured_advice }] }
```

---

## Personas System

### Persona Definition (YAML)

**Location:** `personas/` directory

**Example:** `standards-guardian.yaml`
```yaml
name: standards-guardian
display_name: Standards Guardian
description: Reviews lessons for standards alignment
category: advisory
model: claude-sonnet-4-20250514
temperature: 0.4
max_tokens: 2000

system_prompt: |
  You are the Standards Guardian...

  ## Your Expertise
  - NGSS Science Standards
  - Washington State Standards
  ...

  ## Output Format
  Always respond with these sections:
  ### Observations
  ### Alignment Risks
  ### Suggestions
  ### Questions

grade_levels: ["6", "7", "8"]
subjects: ["science"]
frameworks: ["NGSS", "WA-Science"]
```

### Available Personas

| Persona | Focus |
|---------|-------|
| **Standards Guardian** | Standards alignment (NGSS, CCSS) |
| **Pedagogy Coach** | Instructional design, UbD |
| **Equity Advocate** | Access, differentiation, representation |
| **Time Optimizer** | Feasibility, workload, pacing |

### Response Parsing

The council router parses structured responses using regex:

```python
# Patterns for section headers
## Observations
### Observations
**Observations**

# Extracts bullet points under each section
- Bullet item 1
* Bullet item 2
• Bullet item 3
```

---

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-...
TA_API_PORT=8002
TA_KB_EMBEDDING_MODEL=all-MiniLM-L6-v2
EOF

# Run development server
uvicorn api.main:app --reload --port 8002

# Verify
curl http://localhost:8002/health
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8002" > .env.local

# For auth (optional)
cat >> .env.local << EOF
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
EOF

# Run development server
npm run dev

# Verify
open http://localhost:3000
```

### Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Test endpoints manually
# Upload document
curl -X POST http://localhost:8002/api/v1/sources/upload \
  -F "file=@test.pdf" -F "title=Test Doc"

# Search
curl -X POST http://localhost:8002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?"}'

# Consult council
curl -X POST http://localhost:8002/api/v1/council/consult \
  -H "Content-Type: application/json" \
  -d '{"personas": ["standards-guardian"], "context": "Forces lesson", "question": "Standards aligned?"}'
```

---

## Known Issues

### 1. Duplicate Components

**Issue:** `components/notebook/` and `components/Sources/` have duplicate files (SourceUploader.tsx, SourceList.tsx)

**Resolution:** Keep `Sources/`, remove duplicates from `notebook/`

### 2. Legacy Naming

**Issue:** "Notebook Mode" terminology vs "Knowledge Base"

**Resolution:** Component folder named `notebook` should be renamed or contents moved

### 3. Incomplete Features

| Feature | Status |
|---------|--------|
| URL ingestion | Returns 501 Not Implemented |
| Planning router | Endpoints exist, untested |
| Grading router | Endpoints exist, untested |
| Conversation persistence | Not implemented |

### 4. Frontend Integration

**Issue:** Chat and Council pages have UI but minimal backend integration

**Resolution:** Wire up API calls in page components

---

## Next Steps

### Priority 1: Frontend Integration
1. Wire Chat page to `/api/v1/chat/message`
2. Wire Council page to `/api/v1/council/consult`
3. Test end-to-end upload → search → chat flow

### Priority 2: Polish
1. Remove duplicate components
2. Add loading states and error handling
3. Improve mobile responsiveness

### Priority 3: v0.2 Features
1. Grade Studio (batch grading)
2. Plan Studio (UbD lesson builder)
3. Conversation persistence
4. Multi-user authentication

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Backend entry | `backend/api/main.py` |
| Backend config | `backend/api/config.py` |
| Knowledge service | `backend/libs/knowledge_service.py` |
| Persona store | `backend/libs/persona_store.py` |
| Sources API | `backend/api/routers/sources.py` |
| Chat API | `backend/api/routers/chat.py` |
| Council API | `backend/api/routers/council.py` |
| Narratives API | `backend/api/routers/narratives.py` |
| Frontend API client | `lib/api.ts` |
| Sources store | `stores/sourcesStore.ts` |
| Global layout | `components/GlobalLayout.tsx` |
| Tailwind config | `tailwind.config.ts` |
| Next.js config | `next.config.mjs` |

---

## Contact & Resources

- **Project Repo:** `/Users/danielconnolly/Projects/TeachAssist`
- **CC4 Source:** `/Users/danielconnolly/Projects/CC4` (reference for proven patterns)
- **API Spec:** `docs/API_SPEC.md`
- **Status Updates:** `docs/STATUS.md`

---

*Document generated: 2026-01-29*
