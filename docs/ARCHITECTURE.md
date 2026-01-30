# TeachAssist Architecture

> **Last Updated:** 2026-01-30

## Overview

TeachAssist is a teacher-first AI assistant with a Next.js frontend and FastAPI backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   (Next.js on Vercel)                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Sources  │  │   Chat   │  │ Council  │  │Narratives│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────────────┐
│                        Backend                               │
│              (FastAPI on Railway/Render/Vercel)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Knowledge Service                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  OpenAI    │  │  In-Memory │  │   Hybrid   │     │   │
│  │  │ Embeddings │  │VectorStore │  │   Search   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Personas   │  │  Narratives  │  │    Chat      │      │
│  │   (YAML)     │  │  (Claude)    │  │   (RAG)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
     ┌──────┴──────┐             ┌──────┴──────┐
     │   OpenAI    │             │  Anthropic  │
     │ Embeddings  │             │   Claude    │
     └─────────────┘             └─────────────┘
```

---

## Tech Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (localStorage) |
| Auth | NextAuth.js + Google OAuth |
| Icons | lucide-react |
| Theme | Light/Dark/System toggle |

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| Embeddings | OpenAI API (`text-embedding-3-small`) |
| LLM | Anthropic Claude (`claude-3-5-sonnet`) |
| Vector Store | In-memory (numpy) |
| File Parsing | pypdf, python-docx |

---

## Embedding Strategy

### Why OpenAI Embeddings API?

We chose API-based embeddings over local ML models for serverless compatibility:

| Aspect | Local (sentence-transformers) | API (OpenAI) |
|--------|------------------------------|--------------|
| Model size | ~90MB download | 0 (API call) |
| Cold start | 5-10 seconds | Instant |
| Vercel compatible | No (exceeds 50MB limit) | Yes |
| Quality | Good (384 dims) | Excellent (1536 dims) |
| Cost | Free (but compute-heavy) | ~$0.00002/1K tokens |

### Model Configuration

```python
model = "text-embedding-3-small"
dimensions = 1536
cost_per_1k_tokens = "$0.00002"

# Pilot estimate: 50 docs × 500 tokens = 25K tokens = $0.0005
```

### Embedding Flow

```
1. User uploads PDF/DOCX/TXT
   ↓
2. Backend extracts text content
   ↓
3. OpenAI API generates embedding (1536-dim vector)
   ↓
4. Vector stored in InMemoryVectorStore
   ↓
5. User asks question
   ↓
6. Question → embedding → cosine similarity search
   ↓
7. Top-k results returned with citations
```

---

## App Routes

### Frontend Routes
| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Welcome dashboard | Optional |
| `/sources` | Knowledge Base | Required |
| `/chat` | Grounded Q&A | Required |
| `/council` | Inner Council | Required |
| `/narratives` | Student narratives | Required |
| `/app/plan` | Plan Studio (placeholder) | Required |
| `/app/grade` | Grade Studio (placeholder) | Required |

### API Endpoints

**Sources (Knowledge Base)**
- `POST /api/v1/sources/upload` - Upload document
- `GET /api/v1/sources` - List sources
- `DELETE /api/v1/sources/{id}` - Delete source

**Chat (RAG)**
- `POST /api/v1/chat/message` - Grounded Q&A with citations

**Council (Advisory)**
- `GET /api/v1/council/personas` - List advisors
- `POST /api/v1/council/consult` - Get structured advice

**Narratives**
- `POST /api/v1/narratives/synthesize` - Generate narratives
- `POST /api/v1/narratives/batch` - Batch process class
- `GET /api/v1/narratives/batch/{id}/export` - Export CSV/TXT

---

## Deployment

### Frontend → Vercel
```bash
# Auto-deploy from GitHub
# Environment variables:
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
TEACHASSIST_ALLOWED_EMAILS=shanie@wildvine.com,shanieh@comcast.net
```

### Backend → Railway/Render
```bash
# Environment variables (prefixed with TA_):
TA_ANTHROPIC_API_KEY=sk-ant-...
TA_OPENAI_API_KEY=sk-...
TA_CORS_ORIGINS=["https://teachassist.vercel.app"]
```

---

## Security & Privacy

### Authentication
- Google OAuth via NextAuth.js
- Email allowlist for pilot users
- JWT session tokens

### Data Privacy (FERPA/COPPA Compliant)
- No student PII stored
- Pseudonyms only (initials/codes)
- In-memory storage (no persistence across restarts)
- Teacher controls all uploads
- Accommodations mode toggle (IEP/504 context is session-only)

---

## Cost Estimates (Pilot)

| Service | Monthly Cost |
|---------|-------------|
| Vercel (Frontend) | Free |
| Railway (Backend) | Free tier |
| OpenAI Embeddings | ~$0.01 |
| Anthropic Claude | ~$3-5 |
| **Total** | **~$5/month** |

---

## Future Enhancements (v0.2+)

- PostgreSQL + pgvector for persistent storage
- Grade Studio (rubric-based feedback)
- Plan Studio (UbD lesson planning)
- Sunday Rescue Mode
- Object storage for large files
- Multi-user support
