# Comprehensive Project Review: TeachAssist

## 1. Executive Summary

**TeachAssist** is a "Teacher-first professional operating system" designed as a human-centered AI co-pilot. Built specifically for an overwhelmed 6th–7th grade IB teacher, the project strongly emphasizes ethical guardrails: the AI assists but the human decides. It is decisively not an "AI teacher" or an "autopilot" system. Features such as automatic grading, punitive cheating detection, and student surveillance are explicitly forbidden. 

The application is currently positioned at **v0.1 Pilot**, running as a robust single-user web portal built around prioritizing student privacy (FERPA/COPPA compliance), human-in-the-loop decisions, and strict minimization of Personally Identifiable Information (PII). 

## 2. Core Concepts and Capabilities

TeachAssist represents a major leap in professional workflows for educators, transitioning away from fragmented tools toward an integrated "Teacher OS".

### 2.1 Co-Intelligence & Pedagogical Principles
Instead of blindly automating tasks, TeachAssist uses an "AI as Co-Designer" philosophy based on **Understanding by Design (UbD)**. The AI generates drafts, surfaces feedback patterns, and acts as a reflective partner, preserving the teacher's authority and pedagogical judgment.

### 2.2 Feature Overview (v0.1)
- **Knowledge Base & Grounded Chat (RAG):** Teachers can upload documents (curriculum guides, rubrics, texts) and ingest web URLs. A built-in Retrieval-Augmented Generation (RAG) pipeline allows teachers to chat with their documents, extracting standards, summaries, and misconceptions with strict citations (preventing AI hallucinations).
- **Inner Council:** An innovative feature providing four distinct AI advisory personas: *Standards Guardian*, *Learning Designer*, *Equity Champion*, and *Assessment Authority*. Teachers select an advisor to review lesson plans or ideas, and receive structured feedback (Observations, Risks, Suggestions, and Reflective Questions).
- **Narrative Comment Synthesis (Backend):** A pipeline designed to transform scattered semester data and generic 1-8 IB rubric scores into structured, 4-sentence holistic summary narratives representing student achievement and growth.
- **Accommodations Toggle:** A privacy-first feature that natively brings IEP and 504 plan awareness into AI drafting, enforcing that student data remains session-only.

### 2.3 Planned Features (v0.2)
- **Plan Studio & Grade Studio:** A UbD-guided workflow to structure performance tasks and provide batched, rubric-aligned feedback.
- **Relationships Hub:** Draft threaded communication (emails to parents/staff) with tone-controls.
- **Sunday Rescue Mode:** A flagship feature targeting the Sunday planning grind, batch-processing grades and scaffolding minimum-viable week plans to save multiple hours of administrative load.

## 3. Architecture Structure
- **Frontend Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand for local state management, NextAuth for Google OAuth. Hosted on Vercel.
- **Backend Stack:** Python 3.11+, FastAPI. Communicates heavily via Anthropic's Claude (`claude-3-5-sonnet`) and utilizes the OpenAI API (`text-embedding-3-small`) for generating embeddings.
- **Data Layer:** Currently utilizes an `InMemoryVectorStore` mapped with `sentence-transformers` relying on `numpy`, keeping data strictly transient in the pilot stage. Sources are parsed using `pypdf`, `python-docx`, and `BeautifulSoup4`.

## 4. Integration of the "DT1 IA.docx" Document

The attached document, **DT1 IA.docx**, describes the "Design Technology internal assessment guide"—specifically detailing the marking rubrics for **Criterion C (Ideation and modelling)**, **Criterion D (Designing a solution)**, and **Criterion E (Presenting a solution)**. It outlines strict requirements for mapping models, sketches, and iterative redesigns against feasibility, problem statements, and key features.

### How it fits into TeachAssist:
The `DT1 IA.docx` is the exact form of **curriculum payload** TeachAssist is built to consume via its **Knowledge Base**. 

1. **Grounded Q&A Integration:** Uploading this document to TeachAssist empowers the Grounded Chat to evaluate draft projects against these specific IB guidelines. A teacher can prompt: *"Based on the DT1 IA document, what specifically does a student need to score a 5-6 in Criterion D regarding fidelity models?"* The AI will parse the exact rubric and cite the document ("The student develops a fidelity model thoroughly addressing the problem statement...").
2. **Inner Council Synergy:** The *Assessment Authority* persona can be consulted alongside this document to help the teacher design project briefs that naturally enforce the required constraints in Criteria C, D, and E.
3. **Rubric Engine Payload:** As TeachAssist expands into **Grade Studio** (v0.2), this document will be the baseline for setting grading configurations for Design Technology, enabling rapid, batched grading feedback that specifically references vocabulary like "fidelity model", "iterative refinement", and "third-party manufacturer visualization."

## 5. Suggested Improvements & Roadmap Extensions

While v0.1 is structurally sound and effectively scoped for a pilot, here are key improvements required to advance the project toward maturity (v0.2):

### Technical Improvements
1. **Migrate off InMemory Vector Store:** The `InMemoryVectorStore` limits scalability and will crash ephemeral serverless instances (like Vercel functions). Transitioning to **PostgreSQL with pgvector** (or a managed vector database like Pinecone) is essential for state persistence and handling larger curriculum loads.
2. **Object Storage Over File System:** To accommodate serverless backend deployments securely, migrate PDF/DOCX storage from local `backend/data` formats to S3, Google Cloud Storage, or Cloudflare R2.
3. **Backend Middleware Auth Verification:** Although NextAuth handles frontend session management, the FastAPI backend currently accepts unauthenticated queries natively. Implement JWT verification parsing on the backend API layer.

### Product / Feature Enhancements
1. **Frontend Implementation of Narrative Synthesis:** The backend for batching student narratives using IB standards is finished. This needs to be wired to a Next.js interface to complete the v0.1 deliverables. 
2. **Subject-Agnostic Rubric Generalization:** The PRD mentions that "IB MYP Science criteria" is explicitly built into the narrative synthesizer. To support documents like `DT1 IA.docx`, abstract the criteria mappings into configurable templates (e.g., allow teachers to switch from Science A-D to Design Technology C-E seamlessly).
3. **Intelligent Table Extraction (Rubric Parser):** Documents like `DT1 IA.docx` rely heavily on tables and formatting. Upgrading the ingestion pipeline from `python-docx` to structured vision-based parsers (e.g., LlamaParse or Unstructured.io) will greatly enhance the AI's understanding of complex rubric criteria.
4. **"Sunday Rescue" Interface Prioritization:** The core value proposition of TeachAssist lies in saving teachers weekend hours. Advancing the Grade Batch interface into active development should be the immediate next step post-pilot.
