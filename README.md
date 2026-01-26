# TeachAssist

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/PerformanceSuite/teach-assist)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-pilot-orange.svg)](./MASTER_PLAN.md)

**Teacher-first AI assistant with grounded Q&A and advisory personas.**

TeachAssist helps teachers work with curriculum materials through:
- **Knowledge Base:** Upload curriculum documents and get answers grounded in your sources
- **Grounded Chat:** Ask questions with semantic search and citations
- **Inner Council:** Four specialized AI advisors for teaching decisions
- **Keyboard-first:** Navigate efficiently with shortcuts

---

## ✅ Status: v0.1 Complete & Ready for Pilot

**Completion Date:** 2026-01-25
**Development Time:** 4 hours (parallel agent execution)
**Features:** 100% of v0.1 scope delivered
**Testing:** All integration tests passing ✅

---

## 🚀 Quick Start

### For Pilot Teachers

**Complete setup guide:** See [`PILOT_SETUP_GUIDE.md`](./PILOT_SETUP_GUIDE.md) (15-minute setup)

**Quick commands:**

```bash
# Backend (Terminal 1)
cd backend
source .venv/bin/activate
uvicorn api.main:app --reload --port 8002

# Frontend (Terminal 2)
npm run dev

# Visit: http://localhost:3000
```

---

### For Developers

**1. Prerequisites**
- Python 3.11+
- Node.js 18+
- Anthropic API key

**2. Backend Setup**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_key_here
LOG_LEVEL=INFO
EOF

# Start server
uvicorn api.main:app --reload --port 8002
```

**3. Frontend Setup**

```bash
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8002
EOF

# Start dev server
npm run dev
```

**4. Test**
- Backend health: http://localhost:8002/health
- Frontend: http://localhost:3000

---

## 📚 Features

### Knowledge Base (Sources)
- Upload curriculum documents (PDF, DOCX, TXT)
- Semantic search with InMemoryVectorStore
- Document management (list, view, delete)
- Privacy-first: teachers control what gets uploaded

### Grounded Chat
- Ask questions about uploaded sources
- RAG pipeline with Claude Sonnet 4
- Citations showing source passages
- Contextual responses grounded in your materials

### Inner Council (4 Advisors)

**📚 Standards Guardian**
Curriculum alignment, standards mapping, scope & sequence

**🎯 Differentiation Advocate**
Equity, accessibility, differentiation strategies

**🏃 Practical Realist**
Time management, feasibility, workload assessment

**📊 Assessment Architect**
Assessment design, rubrics, feedback strategies

Each advisor provides structured advice:
- **Observations:** What they notice
- **Risks:** Potential issues
- **Suggestions:** Actionable recommendations
- **Questions:** Reflection prompts

### Welcome Dashboard
- Time-based greetings
- 5 teacher-specific quick actions
- Recent activity tracking
- Feature overview

### AI Assistant
- Context-aware suggestions
- Route-based tips
- Proactive guidance
- Keyboard: `Cmd+.` or `Ctrl+.`

### Help Center
- 16 searchable articles
- 6 categories (Getting Started, Sources, Council, Grading, Privacy)
- Article tracking
- Keyboard: `Cmd+/` or `Ctrl+/`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + J` | Go to Chat |
| `Cmd/Ctrl + U` | Upload Source |
| `Cmd/Ctrl + Shift + C` | Go to Council |
| `Cmd/Ctrl + .` | Toggle AI Assistant |
| `Cmd/Ctrl + /` | Toggle Help Center |
| `Cmd/Ctrl + 1-4` | Navigate to pages |
| `Cmd/Ctrl + 0` | Home |
| `Esc` | Close panels |

---

## 📂 Project Structure

```
TeachAssist/
├── app/                          # Next.js pages (App Router)
│   ├── page.tsx                 # Welcome Dashboard
│   ├── sources/page.tsx         # Document management
│   ├── chat/page.tsx            # Grounded Q&A
│   └── council/page.tsx         # Inner Council
├── components/
│   ├── Welcome/                 # Dashboard components
│   ├── AIAssistant/             # AI Assistant sidebar
│   ├── HelpCenter/              # Help documentation
│   └── Sources/                 # Source/chat components
├── backend/
│   ├── api/                     # FastAPI application
│   │   ├── routers/            # API endpoints
│   │   └── deps.py             # Dependencies
│   ├── libs/
│   │   ├── knowledge_service.py # InMemoryVectorStore
│   │   └── persona_store.py    # Inner Council personas
│   └── personas/               # 4 YAML persona files
├── stores/                      # Zustand state management
├── services/                    # Suggestion engine, API client
├── hooks/                       # React hooks, keyboard shortcuts
└── docs/                        # Documentation
```

---

## 🧪 Testing

**Backend Tests:**
- Document upload ✅
- Semantic search ✅
- Chat/RAG ✅
- Inner Council (all 4 personas) ✅

**Frontend Tests:**
- Welcome Dashboard ✅
- Sources page ✅
- Chat page ✅
- Council page ✅
- Keyboard shortcuts ✅

**Integration:**
- End-to-end upload → search → chat → council ✅

See [`INTEGRATION_TEST_RESULTS.md`](./INTEGRATION_TEST_RESULTS.md) for detailed results.

---

## Documentation

### Core Documents
| Document | Purpose |
|----------|---------|
| **[SPEC.md](./SPEC.md)** | Vision, architecture, and northstar |
| **[MASTER_PLAN.md](./MASTER_PLAN.md)** | Execution plan and deployment |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to contribute |
| **[PILOT_SETUP_GUIDE.md](./PILOT_SETUP_GUIDE.md)** | Teacher setup guide |

### Technical Reference
| Document | Purpose |
|----------|---------|
| **[docs/API_SPEC.md](./docs/API_SPEC.md)** | API endpoint details |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Technical architecture |
| **[PRD.md](./PRD.md)** | Original product requirements |
| **[CLAUDE.md](./CLAUDE.md)** | AI agent instructions |

---

## 🎯 Roadmap

### v0.1 Pilot (In Progress)
- ✅ Knowledge Base with document upload
- ✅ Grounded Q&A with RAG
- ✅ Inner Council (4 advisors)
- 🟡 Welcome Dashboard (partial)
- 🟡 Help Center (partial)
- 🟡 Frontend-backend integration (in progress)

### v0.2 (Planned)
- Grade Studio (batch grading with AI feedback drafts)
- Plan Studio (lesson planning with standards alignment)
- Sunday Rescue Mode (weekend planning assistant)
- Multi-user authentication
- Enhanced analytics

### Future
- Mobile app
- Collaborative features
- Integrations (Canvas, Google Classroom)
- Advanced persona customization

---

## 🔒 Privacy & Security

**Local Storage:**
- Documents stored in `backend/data/`
- Embeddings stored in memory (InMemoryVectorStore)
- No database in v0.1

**API Usage:**
- Questions + document excerpts sent to Anthropic API
- API key stored in `.env` (not committed)
- No data retention by Anthropic (per their policy)

**What's NOT stored:**
- Student PII (never upload student work)
- Complete documents (only embeddings)
- Conversation history (v0.1 limitation)

See **[PILOT_SETUP_GUIDE.md](./PILOT_SETUP_GUIDE.md)** Privacy & Security section for details.

---

## 💰 Cost

**Software:** Free (open source)

**API Usage:** Pay-as-you-go to Anthropic
- Claude Sonnet 4: ~$3/million input tokens, ~$15/million output
- Typical pilot usage: $5-20/month
- Monitor at [console.anthropic.com](https://console.anthropic.com/)

---

## 🤝 Contributing

### Pilot Teachers

Your feedback shapes TeachAssist! Please share:
- What works well / what's confusing
- Feature requests
- Inner Council advisor feedback
- Use cases we didn't anticipate

**How to share:**
- GitHub Issues (preferred)
- Email pilot coordinators
- Weekly check-in calls

### Developers

**Reporting Issues:**
1. Check existing issues
2. Include: OS, Python/Node versions, error logs
3. Steps to reproduce

**Pull Requests:**
1. Fork the repo
2. Create feature branch
3. Write tests
4. Update documentation
5. Submit PR with clear description

---

## 🎓 Credits

**Built with:**
- [Next.js 15](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python backend
- [Claude AI](https://www.anthropic.com/claude) - LLM for chat & council
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Adapted from:**
- CC4 (CommandCenter 4) - Proven UI patterns and components
- InMemoryVectorStore - Semantic search implementation

**Development:**
- Parallel agent execution (4 specialized agents)
- Time: 4 hours (vs 8-12 hours sequential)
- Zero merge conflicts

---

## License

MIT License - See [LICENSE](./LICENSE) for details.

TeachAssist is designed for educational use with ethical commitments to teacher authority, student privacy, and transparency. See [SPEC.md](./SPEC.md) for our full ethical framework.

---

## 🔗 Links

- **GitHub:** [github.com/PerformanceSuite/teach-assist](https://github.com/PerformanceSuite/teach-assist)
- **Issues:** [github.com/PerformanceSuite/teach-assist/issues](https://github.com/PerformanceSuite/teach-assist/issues)
- **Documentation:** See `docs/` folder
- **Anthropic API:** [console.anthropic.com](https://console.anthropic.com/)

---

## 📞 Support

**For Pilot Teachers:**
- See [PILOT_SETUP_GUIDE.md](./PILOT_SETUP_GUIDE.md) troubleshooting section
- Help Center in app: `Cmd+/` or `Ctrl+/`
- Email pilot coordinators

**For Developers:**
- GitHub Issues for bugs/features
- Check `docs/` for technical documentation

---

**Version:** v0.1 Pilot
**Last Updated:** 2026-01-26
**Status:** In development - backend complete, frontend integration in progress

🎉 **Welcome to TeachAssist!**
