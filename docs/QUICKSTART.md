# TeachAssist v0.1 - Quick Start Guide

## ✅ What's Complete

All core functionality for v0.1 is now working:

1. **Knowledge Base** (`/sources`) - Upload and manage documents
2. **AI Chat** (`/chat`) - Ask questions with grounded, cited responses
3. **Inner Council** (`/council`) - Consult specialized teaching advisors
4. **Welcome Dashboard** (`/`) - Quick actions and recent activity
5. **AI Assistant** (Cmd+.) - Context-aware suggestions
6. **Help Center** (Cmd+/) - Searchable documentation

## 🚀 Quick Start (5 minutes)

### Step 1: Start Backend (Terminal 1)

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle/backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002
```

Wait for: `Application startup complete.`

### Step 2: Start Frontend (Terminal 2)

```bash
cd /Users/danielconnolly/Projects/TeachAssist/TeachAssist-v0.1-bundle
npm run dev
```

Open: http://localhost:3000

### Step 3: Test the Flow

1. **Upload a document**
   - Click "Knowledge Base" in nav
   - Upload a PDF, DOCX, or TXT file
   - See confirmation: "✓ Uploaded [filename] - X chunks created"

2. **Ask a question**
   - Click "AI Chat" in nav
   - Type: "What are the main topics in this document?"
   - Get grounded response with citations

3. **Consult Inner Council**
   - Click "Inner Council" in nav
   - Select an advisor (e.g., "Differentiation Architect")
   - Context: "Grade 8 math, mixed abilities"
   - Question: "How do I differentiate fractions lesson?"
   - Get structured advice

## 📂 Page Routes

| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/` | Welcome Dashboard | Quick actions, recent activity, feature overview |
| `/sources` | Knowledge Base | Upload documents, view sources, delete sources |
| `/chat` | AI Chat | Ask questions, grounded responses, citations |
| `/council` | Inner Council | Persona selection, context input, structured advice |

## 🎯 Success Criteria Checklist

- ✅ Teacher can upload curriculum documents
- ✅ Documents are chunked and stored in knowledge base
- ✅ Teacher can ask questions and get cited answers
- ✅ Teacher can consult Inner Council personas
- ✅ All keyboard shortcuts work (Cmd+., Cmd+/)
- ✅ Build passes without errors
- ✅ Navigation works between all pages

## 🔧 API Endpoints (Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/sources/upload` | POST | Upload document |
| `/api/v1/sources` | GET | List all sources |
| `/api/v1/sources/{id}` | GET | Get source details |
| `/api/v1/sources/{id}` | DELETE | Delete source |
| `/api/v1/chat/message` | POST | Send chat message |
| `/api/v1/council/consult` | POST | Consult persona |
| `/api/v1/council/personas` | GET | List personas |
| `/health` | GET | Health check |

## 🎨 Component Architecture

### Pages (App Router)
- `app/page.tsx` - Welcome Dashboard
- `app/sources/page.tsx` - Knowledge Base
- `app/chat/page.tsx` - AI Chat
- `app/council/page.tsx` - Inner Council

### Components
- `components/notebook/SourceUploader.tsx` - File upload
- `components/notebook/SourceList.tsx` - Source management
- `components/notebook/ChatPanel.tsx` - Chat interface
- `components/Welcome/*` - Dashboard components
- `components/AIAssistant/` - Sidebar assistant
- `components/HelpCenter/` - Help documentation

### API Client
- `lib/api.ts` - All backend API calls

### Stores (Zustand)
- `stores/aiAssistantStore.ts` - AI Assistant state
- `stores/helpStore.ts` - Help Center state
- `stores/onboardingStore.ts` - Onboarding state
- `stores/councilStore.ts` - Council state

## 🧪 Testing Scenarios

### Scenario 1: Complete Teacher Workflow
1. Upload "Grade 8 Science Standards.pdf"
2. Upload "Newton's Laws Lesson Plan.docx"
3. Chat: "What are the key learning objectives?"
4. Council → Standards Guardian: "Does this lesson align with standards?"
5. Verify all citations link back to uploaded documents

### Scenario 2: Empty State Handling
1. Start fresh (no sources)
2. Try chat - should show empty state
3. Upload first document
4. Verify chat now works

### Scenario 3: Multi-document Search
1. Upload 3+ documents on different topics
2. Ask specific question about one topic
3. Verify AI cites only relevant documents

## 🐛 Known Issues

### Backend Connection
- If you see "Failed to fetch", check backend is running on port 8002
- Check CORS settings in `backend/api/config.py`

### File Upload
- Supported formats: PDF, DOCX, TXT, MD
- Max file size: Check backend config (default 10MB)
- Large PDFs may take 5-10 seconds to process

### Personas
- If personas don't load, check `personas/*.yaml` files exist
- Verify backend can read persona files

## 🎹 Keyboard Shortcuts

- `Cmd+.` (or `Ctrl+.`) - Toggle AI Assistant
- `Cmd+/` (or `Ctrl+/`) - Toggle Help Center
- `Enter` - Send message (in chat/council)
- `Shift+Enter` - New line (in text areas)

## 📊 What's Next (v0.2)

Future enhancements (NOT in v0.1):
- [ ] Multi-user authentication
- [ ] Persistent storage (PostgreSQL + pgvector)
- [ ] Grade Studio (batch grading)
- [ ] Plan Studio (lesson planning)
- [ ] Sunday Rescue Mode
- [ ] Export/share functionality

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `docs/FINAL_PLAN.md` | Full implementation roadmap |
| `docs/QUICKSTART.md` | This file |
| `lib/api.ts` | API client functions |
| `backend/api/main.py` | FastAPI backend |
| `personas/*.yaml` | Inner Council personas |

---

**v0.1 Status: COMPLETE** ✅

All core functionality is working. Backend and frontend are integrated.
Ready for pilot testing with teachers.
