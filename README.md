# TeachAssist (Pilot)

Teacher-first professional operating system — friend-only pilot.

## Quickstart

1. Install deps
```bash
npm install
```

2. Create env file
```bash
cp .env.example .env.local
```

3. Fill in Google OAuth + `NEXTAUTH_SECRET` (see `docs/DEPLOYMENT.md`).

4. Run dev
```bash
npm run dev
```

Visit: http://localhost:3000

## Docs
- `PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/reference/*` (pedagogical reference)

## Notes
- `/app/*` routes are protected by NextAuth middleware.
- Access is restricted via `TEACHASSIST_ALLOWED_EMAILS` allowlist.
