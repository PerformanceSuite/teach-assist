# TeachAssist — Consolidated PRD & Product Specification (v1.0)

> **Status:** Friend-only pilot (single-teacher)
>
> **Repo:** `PerformanceSuite/teach-assist` (remote: https://github.com/PerformanceSuite/teach-assist.git)
>
> **Hosting:** Vercel (Next.js)
>
> **Auth:** Google OAuth (teacher sign-in)

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

## 4. Product “Rooms” (Teacher OS Portal)

TeachAssist is organized as a calm, professional portal with the following primary rooms:

1. **Today Dashboard**
   - What's due next (grading queue, tomorrow's plan, drafts needing approval)
   - Quick access to key workflows
2. **Sources & Knowledge Base**
   - Upload curriculum documents + grounded chat + transforms
3. **Plan Studio**
   - UbD-guided unit/lesson builder
   - Weekly planner
4. **Grade Studio**
   - Rubrics + narrative comment batching
5. **Relationships Hub**
   - Parent/student/staff messaging drafts + thread summaries + templates
6. **Ideas & Hypotheses**
   - Structured teaching R&D space, linked to evidence
7. **Professional Portal**
   - Credentials, artifacts, interactive resume
   - Optional consent-based “AI Interview Mode”
8. **Principles**
   - Read-only: ethics, pedagogy, guardrails

---

## 5. Core Modules & Capabilities

### 5.1 Teacher Hub (Today Dashboard)

- Active units/lessons
- Upcoming plans (next 1–5 days)
- Draft inbox (feedback drafts, message drafts, lesson drafts)
- Insights (misconceptions, patterns)
- Instant Capture quick entry

### 5.2 Knowledge Base (Sources + Grounded Chat)

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

**Privacy-first design**
- Teachers control what gets uploaded
- Student identifiers should be pseudonymous (e.g., initials) for FERPA/COPPA compliance
- No automatic data collection

### 5.3 Plan Studio (UbD Flow)

Guided workflow:
- Transfer goals
- Performance task (GRASPS)
- Learning sequence
- Formative checks + exit tickets
- Differentiation suggestions (IEP/504 aware *only if provided manually; no PII required*)

### 5.4 Narrative Comment Synthesis (✅ IMPLEMENTED)

**Goal:** Transform scattered semester data into coherent student narratives.

**Status:** Backend API complete and tested (2026-01-26)

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

### 5.5 Grade Studio (Future - v0.2)

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

### 5.6 Relationships Hub (Communications)

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

### 5.7 Ideas & Hypothesis Center

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

### 5.8 Inner Council (Advisory)

Roles (toggleable):
- Standards Guardian
- Pedagogy Coach
- Equity Advocate
- Time Optimizer
- (Optional later) Communication Coach, Professional Narrative Editor

Rules:
- Advise only
- Ask reflective questions
- No directives; teacher decides
- Admit uncertainty

#### Inner Council Prompt Contracts (Templates)

All roles share:
- **Constraint:** “You are advisory only. Do not decide outcomes. Offer questions + options.”
- **Output format:** bullet list under headings: `Observations`, `Risks`, `Suggestions`, `Questions`.

**Standards Guardian**
- Focus: alignment, scope, clarity
- Never critiques teacher style; only alignment

**Pedagogy Coach**
- Focus: transfer vs recall, formative checkpoints, student agency

**Equity Advocate**
- Focus: bias, accessibility, language simplicity, multiple modalities

**Time Optimizer**
- Focus: simplify steps, reduce prep, preserve learning target

### 5.9 Instant Capture

One-click capture of:
- Instructional insights
- Grading reflections
- Communication outcomes
- “What to change next time”

Properties:
- timestamped
- context-linked (lesson/rubric/thread/idea)
- teacher-owned and exportable

### 5.10 Professional Portal

- Credentials
- Artifacts (lesson exemplars, anonymized samples, reflections)
- Philosophy
- Growth timeline

Optional “AI Interview Mode” (future):
- A share link that allows Q&A grounded only in teacher-provided materials
- Strict citation and “no invention” rules

---

## 6. Sunday Rescue Mode (Pilot Flagship)

A guided flow intended for Sunday evenings:

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

### 9.1 Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Google OAuth (NextAuth)
- Vercel hosting

### 9.2 Authentication

- Google OAuth sign-in required
- Only approved teacher email(s) can access (allowlist in env/config)
- Session-based auth; no DB required for v0

### 9.3 Data & Privacy Defaults

- Default to no PII storage
- Student identifiers are pseudonyms (teacher-defined)
- Sources stored minimally (local dev or Vercel storage later)
- Export-first philosophy (teacher can download artifacts)

### 9.4 Deployment

- Vercel project connected to GitHub repo
- Environment variables set in Vercel:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - (optional) `NEXTAUTH_URL` for non-Vercel environments

---

## 10. Repo & Delivery Notes

This repo should be initialized from a clean folder, then pushed to:
- `https://github.com/PerformanceSuite/teach-assist.git`

Primary docs:
- `PRD.md` (this file)
- `docs/reference/` (uploaded reference documents)
- `docs/ARCHITECTURE.md` (lightweight tech design)
- `docs/DEPLOYMENT.md` (Vercel + Google OAuth setup)

