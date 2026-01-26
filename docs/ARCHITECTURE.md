# TeachAssist Architecture (v0)

## Goals
- Ship a usable friend-only pilot fast
- Teacher-first, human-in-the-loop
- Minimal data retention by default
- Vercel-friendly deployment

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- NextAuth (Google OAuth)
- Local storage (JSON) for v0; optional DB later

## App Areas
- `/` Landing/Welcome Dashboard
- `/app` Authenticated portal shell (Today, Sources, Plan, Grade, Relationships, Ideas, Professional)
- `/sources` Knowledge Base / document management
- `/chat` Grounded Q&A
- `/council` Inner Council advisors
- `/api/auth/*` NextAuth routes
- `/api/*` App APIs

## Data Model (v0, minimal)
- Teacher profile (self-authored)
- Artifacts: notes, plans, rubrics, drafts
- Student work: optional, pseudonymous, preferably transient
- Communications drafts: stored locally (teacher-controlled)

## Future Enhancements
- Postgres + Prisma
- Object storage for sources
- Per-class / per-unit workspaces
- Share links (Professional Portal) with explicit consent
