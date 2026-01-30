# TeachAssist — Consolidated PRD & Product Specification (v1.1)

> **Status:** Friend-only pilot (single-teacher)
>
> **Repo:** `PerformanceSuite/teach-assist` (remote: https://github.com/PerformanceSuite/teach-assist.git)
>
> **Hosting:** Vercel (Next.js)
>
> **Auth:** Google OAuth (teacher sign-in)
>
> **Last Updated:** 2026-01-30

---

## Implementation Status

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Sources / Knowledge Base | ✅ Complete | ✅ Complete | **Ready** |
| Grounded Chat (RAG) | ✅ Complete | ✅ Complete | **Ready** |
| Inner Council Advisors | ✅ Complete | ✅ Complete | **Ready** |
| Narrative Synthesis | ✅ Complete | ❌ Not started | **Needs UI** |
| Welcome Dashboard | N/A | ✅ Complete | **Ready** |
| Help Center | N/A | ✅ Complete | **Ready** |
| Accommodations Toggle | N/A | ✅ Complete | **Ready** |
| Grade Studio | 🟡 Scaffolds | 🟡 Placeholder | v0.2 |
| Plan Studio | 🟡 Scaffolds | 🟡 Placeholder | v0.2 |
| Sunday Rescue Mode | ❌ Not started | ❌ Not started | v0.2 |
| **Overall** | **~85%** | **~40%** | |

---

## 0. Executive Summary

TeachAssist is a **teacher-first professional operating system** (Teacher OS): a private portal that reduces weekend workload, improves lesson/assessment quality, and supports reflective practice.

TeachAssist is **not** an “AI teacher.” It is a **human-centered co-pilot**:
- AI assists; humans decide.
- AI drafts; teachers approve.
- AI is transparent, constrained, and grounded.

The pilot is designed to deliver immediate value for an overwhelmed 6th–7th grade IB Science teacher:
- **Knowledge Base:** upload curriculum sources (PDFs, rubrics, standards docs) and ask grounded questions with citations.
- **Inner Council:** AI advisory personas (Standards Guardian, Pedagogy Coach, Equity Advocate, Time Optimizer) that review work and ask reflective questions.
- **Narrative Comment Synthesis:** help teachers transform scattered semester data (grades, formatives, check-ins) into coherent student narratives.
- **Relationships Hub:** teacher-parent/student/staff messaging assistance with tone controls and thread summaries.
- **Professional Portal:** credentials + interactive resume; optional "AI Interview Mode" (consent-based) grounded in teacher artifacts.

---

## 1. Purpose & Scope

TeachAssist supports professional educators with:
- Lesson and unit planning (UbD / backward design)
- Standards-aligned curriculum design
- Authentic assessment creation
- Grading support (**never automated grading**)
- Reflection, iteration, and professional growth
- Communications support (parents/staff/students)
- Professional narrative & credentials

### 1.1 Pilot Constraints (Non-Negotiable)

- **Single-teacher instance** (friend-only pilot)
- **No autonomous student agents**
- **No AI-assigned grades or scores**
- **No AI cheating detection / surveillance**
- **Minimal student data** (pseudonymous identifiers if needed)
- **Teacher retains full authority and accountability**
- **No parent/admin “autopilot” sending** (drafts only; teacher sends)

---

## 2. Foundational Principles (In-App Read-Only)

### 2.1 Human-Centered AI

- AI assists; teachers decide.
- Teacher judgment is the product.
- AI outputs are drafts, lenses, or suggestions.

### 2.2 Co-Intelligence Model

| Human Educator | TeachAssist |
|---|---|
| Defines goals | Generates drafts |
| Applies professional judgment | Surfaces patterns & alternatives |
| Makes decisions | Offers constrained suggestions |
| Reflects & iterates | Retains contextual memory (teacher-owned) |

AI roles:
- Thinking partner
- Critique engine
- Memory amplifier

### 2.3 Ethical Guardrails

TeachAssist enforces:
- No opaque scoring
- No AI grading decisions
- No student surveillance
- No punitive “AI detectors”

TeachAssist prioritizes:
- Transparency
- Teacher consent
- Explainability
- Equity awareness
- Human-in-the-loop accountability

---

## 3. Pedagogical Foundations (Reference Synthesis)

TeachAssist operationalizes two reference docs included in `docs/reference/`:

### 3.1 Strategic AI-in-Education Framework (Summary)

Four pillars:
1. **AI Literacy**
2. **Curriculum Co-Design** (UbD / backward design)
3. **Assessment Transformation** (authentic, formative, performance-based)
4. **Ethical Governance** (privacy, bias, oversight)

### 3.2 “AI as Co-Designer” UbD Workflow (Summary)

TeachAssist encodes a repeatable design flow:
1. Define transfer goals
2. Design authentic performance tasks
3. Plan aligned learning experiences
4. Reflect, revise, improve

---

## 4. Product "Rooms" (Teacher OS Portal)

TeachAssist is organized as a calm, professional portal with the following primary rooms:

1. **Welcome Dashboard** ✅ *Implemented*
   - Teacher-specific greeting, quick start actions
   - Recent activity feed, feature overview for new users
   - Compliance note (FERPA/COPPA)
2. **Sources & Knowledge Base** ✅ *Implemented*
   - Upload curriculum documents + grounded chat + transforms
   - Drag-and-drop upload, source list, KB statistics
3. **Inner Council** ✅ *Implemented*
   - AI advisory personas with structured feedback
   - Persona selection, consultation workflow
4. **Plan Studio** 🟡 *Placeholder (v0.2)*
   - UbD-guided unit/lesson builder
   - Weekly planner
5. **Grade Studio** 🟡 *Placeholder (v0.2)*
   - Rubrics + narrative comment batching
6. **Relationships Hub** 🟡 *Placeholder (v0.2)*
   - Parent/student/staff messaging drafts + thread summaries + templates
7. **Ideas & Hypotheses** 🟡 *Placeholder (v0.2)*
   - Structured teaching R&D space, linked to evidence
8. **Professional Portal** 🟡 *Placeholder (v0.2)*
   - Credentials, artifacts, interactive resume
   - Optional consent-based "AI Interview Mode"
9. **Principles** 🟡 *Partial*
   - Read-only: ethics, pedagogy, guardrails (displays PRD excerpt)

---

## 5. Core Modules & Capabilities

### 5.1 Teacher Hub (Today Dashboard) 🟡 *Partial*

*Current state: Welcome dashboard implemented; Today-specific features planned for v0.2*

- ~~Active units/lessons~~ (v0.2)
- ~~Upcoming plans (next 1–5 days)~~ (v0.2)
- ~~Draft inbox (feedback drafts, message drafts, lesson drafts)~~ (v0.2)
- ~~Insights (misconceptions, patterns)~~ (v0.2)
- ~~Instant Capture quick entry~~ (v0.2)

**Implemented:**
- Quick start actions (Upload Sources, Ask Question, Consult Council, Plan Studio, Help)
- Recent activity feed
- Feature overview for new users
- Compliance note (FERPA/COPPA)

### 5.2 Knowledge Base (Sources + Grounded Chat) ✅ *Implemented*

The Knowledge Base provides a grounded workspace where teachers upload curriculum materials and ask questions that are answered with citations.

**Source types**
- PDFs, docs, links
- Rubrics, exemplars, standards documents
- Teacher notes, assessment data
- IB criteria documentation

**Grounded chat rules**
- Must ground answers in uploaded sources
- Cite passages when applicable
- If insufficient evidence: say so (no invention)

**Transforms**
- Summaries for student-facing or teacher-facing audiences
- Misconception extraction
- Standards mapping
- Week plan generation
- Rubric drafting

**Privacy-first design** *(see [Compliance Glossary](#glossary))*
- Teachers control what gets uploaded
- Student identifiers should be pseudonymous (e.g., initials) for [FERPA](#glossary)/[COPPA](#glossary) compliance
- No automatic data collection

**API Endpoints (Implemented):**
- `POST /api/v1/sources/upload` - Upload PDF, DOCX, TXT, MD files
- `GET /api/v1/sources` - List sources with filters
- `GET /api/v1/sources/{id}` - Source details and preview
- `DELETE /api/v1/sources/{id}` - Delete source
- `GET /api/v1/sources/stats` - KB statistics
- `POST /api/v1/chat/message` - Grounded Q&A with citations
- `POST /api/v1/chat/transform` - Transform sources (summarize, extract, map standards)

**Frontend Components:**
- `/sources` page with drag-and-drop upload
- Source list with delete functionality
- KB statistics display
- `/chat` page with citation display

### 5.3 Plan Studio (UbD Flow) 🟡 *Placeholder (v0.2)*

Guided workflow:
- Transfer goals
- Performance task (GRASPS)
- Learning sequence
- Formative checks + exit tickets
- Differentiation suggestions (accommodations-aware for [IEP/504 plans](#glossary) *only if teacher provides context manually; no student PII stored*)

### 5.4 Narrative Comment Synthesis ✅ *Backend Complete* / ❌ *Frontend Not Started*

**Goal:** Transform scattered semester data into coherent student narratives.

**Status:** Backend API complete and tested (2026-01-26). **Frontend UI not yet implemented.**

Capabilities:
- Input: student initials, IB criteria scores (1-8), teacher observations, notable work
- **4-sentence structure:** Achievement → Evidence → Growth → Outlook
- IB MYP Science criteria built-in (Criteria A-D)
- Batch processing with student clustering by growth area
- Cross-student pattern detection
- Optional Inner Council review (Equity Advocate checks for deficit framing)
- Export to CSV/TXT for ISAMS integration

Hard constraints:
- FERPA-safe: initials only, no full names
- No finalization without teacher review/edit
- Teacher always has final authority

**API Endpoints:**
- `POST /api/v1/narratives/synthesize` - Generate narratives
- `POST /api/v1/narratives/batch` - Batch processing
- `GET /api/v1/narratives/batch/{id}/export` - Export for ISAMS

### 5.5 Grade Studio 🟡 *Scaffolds Only (v0.2)*

**Goal:** Make "~50 narrative comments" feasible without losing humanity.

Capabilities:
- Rubric creation/import
- Work intake (paste/upload) with pseudonymous IDs
- **Batch clustering by feedback pattern** (e.g., missing evidence, strong reasoning/weak explanation)
- Draft narrative comments per student (3–5 sentences), grounded in rubric + evidence cues
- Teacher rapid review/approve/edit
- Export comments (CSV, copy-ready)

Hard constraints:
- No AI scoring
- No finalization without teacher action

### 5.6 Relationships Hub (Communications) 🟡 *Placeholder (v0.2)*

Thread types:
- Parent/guardian
- Student
- Staff (principal, specialist, colleagues)

Features:
- Draft responses with tone control (warm / neutral / firm)
- Summarize threads (“what happened / agreement / next step”)
- Template library (missing work, behavior, progress update, meeting request)
- Translation assist (draft only; teacher review)

Hard constraints:
- No automatic sending
- No storing sensitive student data beyond what teacher provides intentionally

### 5.7 Ideas & Hypothesis Center 🟡 *Placeholder (v0.2)*

Structured thinking environment for instructional iteration.

Idea types:
- Hypothesis
- Observation
- Draft
- Proven
- Needs Revision

Linkages:
- Standards
- Lessons/units
- Assessments/rubrics
- Outcomes and evidence

### 5.8 Inner Council (Advisory) ✅ *Implemented*

**Status:** Full backend and frontend implementation complete.

Roles (toggleable):
- Standards Guardian
- Learning Designer (was Pedagogy Coach)
- Equity Champion (was Equity Advocate)
- Assessment Authority (was Time Optimizer)

**Implemented Personas (YAML-based in `personas/`):**
- `standards-guardian.yaml` - Standards alignment, scope, clarity
- `learning-designer.yaml` - Transfer vs recall, formative checkpoints
- `equity-champion.yaml` - Bias, accessibility, multiple modalities
- `assessment-authority.yaml` - Authentic assessment, rubric quality

Rules:
- Advise only
- Ask reflective questions
- No directives; teacher decides
- Admit uncertainty

**API Endpoints:**
- `GET /api/v1/council/personas` - List all advisors
- `GET /api/v1/council/personas/{name}` - Get advisor details
- `POST /api/v1/council/consult` - Get structured advice
- `POST /api/v1/council/chat` - Ongoing conversation

**Frontend:**
- `/council` page with persona selection grid
- Context and question input
- Structured response display (observations, risks, suggestions, questions)

#### Inner Council Response Format

All advisors return structured responses:
- **Observations** - What they notice
- **Risks** - Potential concerns
- **Suggestions** - Options to consider
- **Questions** - Reflective prompts for teacher

### 5.9 Instant Capture 🟡 *Placeholder (v0.2)*

One-click capture of:
- Instructional insights
- Grading reflections
- Communication outcomes
- "What to change next time"

Properties:
- timestamped
- context-linked (lesson/rubric/thread/idea)
- teacher-owned and exportable

### 5.10 Professional Portal 🟡 *Placeholder (v0.2)*

- Credentials
- Artifacts (lesson exemplars, anonymized samples, reflections)
- Philosophy
- Growth timeline

Optional “AI Interview Mode” (future):
- A share link that allows Q&A grounded only in teacher-provided materials
- Strict citation and “no invention” rules

---

## 6. Sunday Rescue Mode (Pilot Flagship) ❌ *Not Started (v0.2)*

A guided flow intended for Sunday evenings (planned for v0.2):

1. **Grade Batch**
   - Select class + assignment
   - Attach rubric
   - Paste/upload student work (pseudonymous)
   - Get clustered feedback groups + drafts
   - Rapid approve/edit
2. **Plan Tuesday / Week**
   - Choose class (Science 6)
   - Provide constraints (time, materials)
   - Generate a “minimum viable lesson” + “stretch option”
   - Export printable plan + slides outline

Success criterion:
- Saves multiple hours per weekend
- Produces feedback that feels human and specific

---

## 7. Non-Goals (Pilot Protection)

TeachAssist will not:
- Replace teacher judgment
- Auto-grade or assign scores
- Detect cheating
- Create permanent student profiles
- Autonomously message parents/admins
- Serve as district reporting system (yet)

---

## 8. Success Criteria

Pilot is successful if:
- Teacher reports meaningful time savings
- Narrative comments become manageable
- Lesson planning friction decreases
- Trust remains high
- Ethical constraints remain intact

---

## 9. Technical Requirements (v0)

### 9.1 Stack ✅ *Implemented*

**Backend (FastAPI):**
- FastAPI + Python 3.11+
- Anthropic Claude API (claude-3-5-sonnet)
- InMemoryVectorStore (numpy-based, replaced ChromaDB)
- sentence-transformers for embeddings
- File system storage for sources and metadata

**Frontend (Next.js):**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + lucide-react icons
- Zustand for state management
- React Hook Form for form handling

**Key Files:**
- Backend entry: `backend/api/main.py`
- Knowledge service: `backend/libs/knowledge_service.py`
- API client: `lib/api.ts`
- Global layout: `components/GlobalLayout.tsx`

### 9.2 Authentication 🟡 *Partial*

- Google OAuth sign-in (NextAuth) - route stub exists
- Session display in header
- **Note:** Backend authentication middleware not yet implemented
- Only approved teacher email(s) can access (allowlist in env/config)

### 9.3 Data & Privacy Defaults ✅ *Implemented*

- Default to no PII storage
- Student identifiers are pseudonyms (teacher-defined)
- Sources stored on file system (`backend/data/sources/`)
- InMemoryVectorStore (resets on server restart)
- Export-first philosophy (CSV/TXT/JSON export for narratives)

### 9.4 Deployment

- Vercel project connected to GitHub repo
- Backend runs separately (uvicorn on port 8002)
- Environment variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXT_PUBLIC_API_URL` (backend URL, default: http://localhost:8002)
  - `ANTHROPIC_API_KEY` (for Claude API)

---

## 10. Repo & Delivery Notes

This repo should be initialized from a clean folder, then pushed to:
- `https://github.com/PerformanceSuite/teach-assist.git`

Primary docs:
- `PRD.md` (this file)
- `docs/reference/` (uploaded reference documents)
- `docs/ARCHITECTURE.md` (lightweight tech design)
- `docs/DEPLOYMENT.md` (Vercel + Google OAuth setup)

---

## 11. UI Compliance Indicators ✅ *Implemented*

### 11.1 Welcome Page Compliance Note

The welcome page displays a **Privacy-First Design** note with:
- Shield icon indicating compliance focus
- Links to external FERPA and COPPA resources
- Guidance on using pseudonyms (initials/codes, not student names)

**File:** `components/Welcome/ComplianceNote.tsx`

### 11.2 Accommodations Mode Toggle

A global toggle in the header allows teachers to enable **Accommodations Mode** for IEP/504-aware features.

**Behavior:**
- **OFF (default):** Subtle accessibility icon in header
- **ON:** Purple highlight, dropdown shows IEP/504 privacy notice

**Privacy Notice (shown when ON):**
- No student PII stored
- Teacher provides accommodation context manually (e.g., "extended time", "visual supports")
- Use codes or initials, never student names
- Context is session-only and not retained

**Links to glossary resources:**
- [IEP](https://www.understood.org/en/articles/what-is-an-iep) - Individualized Education Program
- [504 Plan](https://www.understood.org/en/articles/what-is-a-504-plan) - Section 504 accommodation plan

**Files:**
- `components/AccommodationsToggle.tsx` - Toggle UI component
- `stores/preferencesStore.ts` - Persisted preference state

### 11.3 Page-Specific Indicators (Future)

Additional page-level indicators planned for v0.2:
- Knowledge Base / Sources → FERPA notice badge
- Grade Studio → FERPA notice badge
- Narrative Synthesis → FERPA notice badge

---

## Glossary

*Educational and legal terms used in TeachAssist. Click links for authoritative external resources.*

<a id="glossary"></a>

### Legal & Privacy

| Term | Definition | Learn More |
|------|------------|------------|
| **FERPA** | Family Educational Rights and Privacy Act. US federal law protecting student education records. TeachAssist uses pseudonyms (initials) to avoid storing protected data. | [US Dept. of Education](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html) |
| **COPPA** | Children's Online Privacy Protection Act. US law protecting personal information of children under 13. TeachAssist does not collect student PII. | [FTC COPPA Guide](https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy) |
| **PII** | Personally Identifiable Information. Any data that could identify a specific student (name, ID number, etc.). TeachAssist avoids storing PII by design. | [NIST Definition](https://csrc.nist.gov/glossary/term/personally_identifiable_information) |

### Special Education

| Term | Definition | Learn More |
|------|------------|------------|
| **IEP** | Individualized Education Program. A legally binding document for students with disabilities (ages 3-21) that outlines specific learning goals, services, and accommodations. | [Understood.org IEP Guide](https://www.understood.org/en/articles/what-is-an-iep) |
| **504 Plan** | Section 504 accommodation plan. Provides accommodations for students with disabilities that affect learning (e.g., extended time, preferential seating) but doesn't require specialized instruction like an IEP. | [Understood.org 504 Guide](https://www.understood.org/en/articles/what-is-a-504-plan) |

### Curriculum Design

| Term | Definition | Learn More |
|------|------------|------------|
| **UbD** | Understanding by Design. A backward-design curriculum framework: start with desired outcomes, then design assessments, then plan instruction. | [ASCD UbD Overview](https://www.ascd.org/books/understanding-by-design-expanded-2nd-edition) |
| **GRASPS** | Goal, Role, Audience, Situation, Product, Standards. A framework for designing authentic performance tasks within UbD. | [Defined Learning GRASPS](https://www.definedlearning.com/blog/grasps-framework/) |
| **IB MYP** | International Baccalaureate Middle Years Programme. A curriculum framework for ages 11-16 with criterion-referenced assessment (1-8 scale). | [IB MYP Overview](https://www.ibo.org/programmes/middle-years-programme/) |

