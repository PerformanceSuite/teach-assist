# Deployment (Vercel + Google OAuth)

## 1) Create Google OAuth credentials
1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create an OAuth Client ID (Web application).
3. Authorized redirect URI:
   - `https://<your-vercel-domain>/api/auth/callback/google`
   - For local dev: `http://localhost:3000/api/auth/callback/google`

## 2) Configure environment variables

Create `.env.local` for local dev, and set the same values in Vercel Project Settings:

- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `NEXTAUTH_SECRET=...` (generate via `openssl rand -base64 32`)

Optional:
- `NEXTAUTH_URL=https://<your-domain>` (generally not required on Vercel)

## 3) Vercel
1. Import the GitHub repo into Vercel.
2. Ensure build settings are default (Next.js).
3. Add env vars for Production + Preview + Development.
4. Deploy.

## 4) Access control (pilot)
Set `TEACHASSIST_ALLOWED_EMAILS` in Vercel (comma-separated):
- `TEACHASSIST_ALLOWED_EMAILS=teacher@example.com,other@example.com`

TeachAssist will deny access to non-allowlisted accounts.

