# TeachAssist Product Specification & Vision

> **The Northstar Document for TeachAssist Development**
>
> Version: 1.0 | Last Updated: 2026-01-25 | Status: v0.1 Pilot Complete

---

## Executive Summary

**TeachAssist** is a teacher-first professional operating system that reduces workload, improves instructional quality, and supports reflective practice through grounded AI assistance.

**Core Philosophy:** AI assists; humans decide. Teachers retain full authority and accountability.

**Target User:** K-12 educators who want AI to help with curriculum work while maintaining their professional voice and judgment.

---

## 1. Vision & Northstar

### 1.1 The Problem We're Solving

Teachers face an impossible workload: lesson planning, grading, parent communication, differentiation, standards alignment, and professional development—all while teaching 5+ hours daily. Weekend work is the norm, not the exception.

Existing tools either:
- **Replace teacher judgment** (auto-grading, AI-generated lessons) — eroding professionalism
- **Add complexity** (more dashboards, more data entry) — increasing workload
- **Ignore context** (generic responses) — providing little value

### 1.2 Our Northstar

> **TeachAssist should feel like having a brilliant teaching partner who has read all your curriculum, knows your standards, respects your expertise, and is available 24/7 to help you think through problems—but never makes decisions for you.**

### 1.3 Guiding Principles

| Principle | What It Means |
|-----------|---------------|
| **Teacher Authority** | AI suggests, drafts, and advises. Teachers decide, edit, and approve. |
| **Grounded Intelligence** | All AI responses are grounded in teacher-uploaded sources, not hallucinated. |
| **Transparent Constraints** | AI admits limitations, cites sources, and explains reasoning. |
| **Privacy by Design** | Student PII never uploaded. Teacher data stays local. API calls are minimal. |
| **Workload Reduction** | Every feature must demonstrably save time or improve quality. |
| **Professional Voice** | AI drafts preserve teacher's authentic communication style. |

---

## 2. Product Architecture

### 2.1 Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        TeachAssist                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Knowledge  │  │   Inner     │  │   Welcome   │             │
│  │    Base     │  │   Council   │  │  Dashboard  │             │
│  │ (RAG Chat)  │  │ (Advisors)  │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Grade    │  │    Plan     │  │   Sunday    │  (v0.2)     │
│  │   Studio    │  │   Studio    │  │   Rescue    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Knowledge Service                     │   │
│  │   InMemoryVectorStore + Sentence Transformers           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    LLM Integration                       │   │
│  │   Claude Sonnet 4 (via Anthropic API)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Knowledge Base (RAG)

**Purpose:** Ask questions about uploaded curriculum and get grounded, cited answers.

**How It Works:**
1. Teacher uploads curriculum documents (PDF, DOCX, TXT)
2. Documents are chunked and embedded using sentence-transformers
3. Embeddings stored in InMemoryVectorStore
4. Questions trigger hybrid search (vector + keyword)
5. Relevant chunks passed to Claude with the question
6. Claude generates grounded response with citations

**Key Constraints:**
- All answers must cite source passages
- If no relevant source exists, AI admits it doesn't know
- No hallucination—grounded responses only

### 2.3 Inner Council

**Purpose:** Four specialized AI advisors provide structured feedback on teaching decisions.

**The Advisors:**

| Advisor | Focus | When to Use |
|---------|-------|-------------|
| **Standards Guardian** | Curriculum alignment, scope, sequence | Planning lessons, checking coverage |
| **Equity Advocate** | Accessibility, differentiation, inclusion | Reviewing for diverse learners |
| **Pedagogy Coach** | Instructional design, student agency | Improving lesson engagement |
| **Time Optimizer** | Efficiency, feasibility, sustainability | Managing workload, simplifying |

**Response Format:**
Each advisor provides structured advice:
- **Observations:** What they notice
- **Risks:** Potential issues
- **Suggestions:** Actionable recommendations
- **Questions:** Prompts for teacher reflection

**Key Constraint:** Advisors advise only—they never make decisions for teachers.

### 2.4 Welcome Dashboard

**Purpose:** Central hub with quick actions and recent activity.

**Features:**
- Time-based greeting
- 5 teacher-specific quick actions
- Recent activity feed (uploads, chats, council consultations)
- Feature overview for new users

### 2.5 AI Assistant & Help Center

**AI Assistant (Cmd+.):** Context-aware sidebar with proactive suggestions based on current page and data state.

**Help Center (Cmd+/):** 16 searchable articles across 6 categories covering all features, privacy, and workflows.

---

## 3. Technical Architecture

### 3.1 Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first styling |
| **State** | Zustand | Lightweight state management |
| **Backend** | FastAPI (Python 3.11+) | REST API |
| **Embeddings** | sentence-transformers | Local document embeddings |
| **Vector Store** | InMemoryVectorStore | Semantic search (numpy-based) |
| **LLM** | Claude Sonnet 4 | Chat and advisory responses |
| **Deployment** | Vercel (frontend) + Fly.io/Railway (backend) | Cloud hosting |

### 3.2 API Structure

```
/health                          # Health check
/api/v1/sources/
  POST /upload                   # Upload document
  GET  /                         # List sources
  GET  /{source_id}              # Get source details
  DELETE /{source_id}            # Delete source
/api/v1/chat/
  POST /message                  # Send chat message (RAG)
  POST /ask                      # Quick question (simplified)
/api/v1/council/
  GET  /personas                 # List advisors
  GET  /personas/{name}          # Get advisor details
  POST /consult                  # Get structured advice
```

### 3.3 Data Flow

```
Teacher                                                  Claude API
   │                                                          │
   │  1. Upload PDF                                           │
   ├────────────────────────────►                             │
   │                              FastAPI                     │
   │                                 │                        │
   │                    2. Chunk & Embed                      │
   │                                 │                        │
   │                    InMemoryVectorStore                   │
   │                                 │                        │
   │  3. Ask Question                │                        │
   ├────────────────────────────────►│                        │
   │                    4. Hybrid Search                      │
   │                                 │                        │
   │                    5. Retrieved Chunks                   │
   │                                 │                        │
   │                    6. Query + Context ──────────────────►│
   │                                 │                        │
   │                    7. Grounded Response ◄────────────────│
   │◄────────────────────────────────│                        │
   │  8. Cited Answer                │                        │
   ▼                                                          ▼
```

### 3.4 Security & Privacy

| Concern | Implementation |
|---------|----------------|
| **API Keys** | Stored in `.env`, never committed |
| **Student Data** | Never uploaded—use pseudonyms only |
| **Document Storage** | Local filesystem (backend/data/) |
| **API Calls** | Only question + relevant chunks sent to Claude |
| **Conversation History** | Not persisted in v0.1 |
| **CORS** | Restricted to known origins |

---

## 4. Feature Roadmap

### 4.1 Version History

| Version | Status | Focus |
|---------|--------|-------|
| **v0.1** | 🟡 In Progress | Knowledge Base + Inner Council + Dashboard |
| **v0.2** | 🔜 Planned | Grade Studio + Plan Studio + Auth |
| **v0.3** | 📋 Backlog | Sunday Rescue + Relationships Hub |
| **v1.0** | 🎯 Target | Production-ready with mobile support |

### 4.2 v0.1 Pilot (Current)

**Status:** ✅ Complete

**Features:**
- [x] Document upload (PDF, DOCX, TXT)
- [x] Grounded Q&A with citations
- [x] Inner Council (4 advisors)
- [x] Welcome Dashboard
- [x] AI Assistant sidebar
- [x] Help Center (16 articles)
- [x] Keyboard shortcuts (9 configured)
- [x] Dark theme UI

**Success Metrics:**
- Teacher can upload sources and get grounded answers
- Inner Council provides useful advisory feedback
- Setup takes <15 minutes

### 4.3 v0.2 Planned Features

**Grade Studio:**
- Upload rubric + student work (pseudonymous)
- AI clusters submissions by feedback pattern
- Draft narrative comments (3-5 sentences each)
- Teacher review/edit/approve workflow
- Export to CSV

**Plan Studio:**
- UbD/backward design workflow
- Standards alignment checking
- Performance task generation (GRASPS)
- Differentiation suggestions
- Weekly planner view

**Authentication:**
- Google OAuth sign-in
- Email allowlist for pilot
- Session management

### 4.4 v0.3 Future Features

**Sunday Rescue Mode:**
- Guided weekend workflow
- Batch grade + plan next week
- Emergency lesson plan generator
- Sub plan template

**Relationships Hub:**
- Parent communication drafts
- Tone controls (warm/neutral/firm)
- Thread summarization
- Template library

### 4.5 Long-term Vision

**Professional Portal:**
- Teacher credentials showcase
- Teaching philosophy statement
- Artifact gallery
- Optional "AI Interview Mode" for job seekers

**Mobile App:**
- PWA or native app
- Offline document access
- Quick capture of teaching insights

**Integrations:**
- Canvas LMS
- Google Classroom
- State standards databases
- Assessment platforms

---

## 5. Ethical Framework

### 5.1 Non-Negotiables

| Rule | Rationale |
|------|-----------|
| **No AI Grading** | Grades require human judgment |
| **No Auto-Send** | Communications need teacher approval |
| **No Student Surveillance** | No AI cheating detection |
| **No PII Storage** | Protect student privacy |
| **Teacher Authority** | AI advises, teacher decides |

### 5.2 Transparency Requirements

- AI always identifies itself as AI
- Limitations are stated clearly
- Sources are cited
- Uncertainty is acknowledged
- No manipulation or dark patterns

### 5.3 Bias Mitigation

- Equity Advocate persona reviews for bias
- Diverse examples in prompts
- Regular prompt auditing
- Teacher feedback loops

---

## 6. Success Criteria

### 6.1 Pilot Success (v0.1)

| Metric | Target |
|--------|--------|
| Time to first grounded answer | < 5 minutes after setup |
| Teacher reports value | 4+ on 5-point scale |
| Weekend workload reduction | "Some" or "Significant" |
| Trust in AI responses | "Usually" or "Always" accurate |
| Would recommend to colleague | Yes |

### 6.2 Production Success (v1.0)

| Metric | Target |
|--------|--------|
| Monthly active users | 100+ teachers |
| Retention (30-day) | 60%+ |
| NPS score | 40+ |
| Documents uploaded per teacher | 10+ |
| Council consultations per week | 3+ |

---

## 7. Development Principles

### 7.1 Code Quality

- TypeScript for frontend
- Python type hints for backend
- Comprehensive error handling
- Clean separation of concerns
- Tests for critical paths

### 7.2 Documentation

- README.md: Quick start
- SPEC.md: This document (vision)
- CONTRIBUTING.md: How to contribute
- Inline comments for complex logic
- API documentation via OpenAPI

### 7.3 Deployment

- Vercel for frontend (free tier)
- Fly.io/Railway for backend (free tier)
- Environment variables for secrets
- CI/CD via GitHub Actions (future)

---

## 8. Related Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **README.md** | Quick start guide | Root |
| **CONTRIBUTING.md** | Contribution guidelines | Root |
| **MASTER_PLAN.md** | Execution plan + deployment | Root |
| **PRD.md** | Original product requirements | Root |
| **docs/API_SPEC.md** | API endpoint details | docs/ |
| **PILOT_SETUP_GUIDE.md** | Teacher setup instructions | Root |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Grounded Response** | AI answer based only on uploaded sources |
| **Inner Council** | Four AI advisory personas |
| **Knowledge Base** | Teacher's uploaded curriculum sources for RAG-based Q&A |
| **RAG** | Retrieval-Augmented Generation |
| **Persona** | AI character with specific focus and constraints |
| **UbD** | Understanding by Design (backward design) |
| **GRASPS** | Goal, Role, Audience, Situation, Product, Standards |

---

## 10. Appendix: Design Decisions

### Why InMemoryVectorStore instead of ChromaDB?

ChromaDB has Pydantic v2 compatibility issues. InMemoryVectorStore (from CC4) is simpler, has no external dependencies, and is proven in production. For v1.0+, consider pgvector for persistence.

### Why Claude Sonnet instead of GPT-4?

- Better instruction following
- More nuanced responses
- Strong educational domain knowledge
- Anthropic's safety focus aligns with our ethics

### Why Next.js instead of pure React?

- App Router for clean routing
- SSR capability for future SEO
- File-based routing
- Built-in optimization
- Easy Vercel deployment

### Why Zustand instead of Redux?

- Simpler API
- Less boilerplate
- Proven in CC4
- Good TypeScript support
- Persist middleware for localStorage

---

**This is a living document. Update it as the product evolves.**

*Last updated: 2026-01-26*
*Maintainer: TeachAssist Development Team*
