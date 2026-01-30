# Deployment Options Guide

> **Last Updated:** 2026-01-30
>
> This guide helps you choose the right deployment setup for TeachAssist.

---

## Quick Decision

| If you want... | Choose |
|----------------|--------|
| Simplest setup (two platforms) | [Railway + Vercel](#option-a-railway--vercel-recommended) |
| 100% free tier | [Render + Vercel](#option-b-render--vercel-free-tier) |
| Single platform | [Vercel only](#option-c-vercel-only-advanced) |

---

## What Needs to be Deployed

TeachAssist has two parts:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js | UI, auth, routing |
| **Backend** | FastAPI (Python) | API, embeddings, AI |

Both need hosting. The frontend always goes to **Vercel** (best Next.js support). The backend has options.

---

## Option A: Railway + Vercel (Recommended)

**Best for:** Quick setup, reliable free tier, good developer experience

### Backend → Railway

| Aspect | Details |
|--------|---------|
| **URL** | `https://teachassist-api.up.railway.app` |
| **Free tier** | 500 hours/month (~21 days continuous) |
| **Cold start** | ~2-5 seconds |
| **Setup time** | ~10 minutes |

**Steps:**
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Select `teach-assist` repo
4. Set root directory: `backend`
5. Add environment variables:
   ```
   TA_ANTHROPIC_API_KEY=sk-ant-...
   TA_OPENAI_API_KEY=sk-...
   PORT=8002
   ```
6. Deploy → Copy the generated URL

### Frontend → Vercel

**Steps:**
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. "Import Project" → Select `teach-assist` repo
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://teachassist-api.up.railway.app
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_SECRET=... (run: openssl rand -base64 32)
   TEACHASSIST_ALLOWED_EMAILS=shanie@wildvine.com,shanieh@comcast.net
   ```
4. Deploy

### Cost: $0-5/month
- Railway: Free (within limits)
- Vercel: Free
- OpenAI: ~$0.01
- Anthropic: ~$3-5

---

## Option B: Render + Vercel (Free Tier)

**Best for:** Maximizing free tier, backup option

### Backend → Render

| Aspect | Details |
|--------|---------|
| **URL** | `https://teachassist-api.onrender.com` |
| **Free tier** | 750 hours/month, spins down after 15min idle |
| **Cold start** | ~30-60 seconds (free tier) |
| **Setup time** | ~15 minutes |

**Steps:**
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. "New" → "Web Service"
3. Connect `teach-assist` repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Deploy

### Frontend → Vercel
Same as Option A, but use Render URL for `NEXT_PUBLIC_API_URL`

### Cost: $0-5/month
- Render: Free (slower cold starts)
- Vercel: Free
- APIs: Same as above

---

## Option C: Vercel Only (Advanced)

**Best for:** Single platform management, requires code restructure

### How it works
Convert FastAPI backend to Vercel Python serverless functions in `/api` directory.

### Pros
- Single deployment platform
- Unified billing/monitoring
- No CORS issues (same domain)

### Cons
- Requires code restructure
- 10-second function timeout (free tier)
- More complex setup

### Steps (High-level)
1. Create `/api` directory for Python functions
2. Convert FastAPI routes to Vercel format
3. Configure `vercel.json` for Python runtime
4. Deploy

**Effort:** ~2-4 hours of code changes

---

## Environment Variables Reference

### Backend (Railway/Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `TA_ANTHROPIC_API_KEY` | Yes | Claude API key for council/narratives |
| `TA_OPENAI_API_KEY` | Yes | OpenAI key for embeddings |
| `TA_CORS_ORIGINS` | Recommended | `["https://teachassist.vercel.app"]` |
| `PORT` | Yes | `8002` (Railway) or `$PORT` (Render) |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL from Railway/Render |
| `GOOGLE_CLIENT_ID` | Yes | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | From Google Cloud Console |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `TEACHASSIST_ALLOWED_EMAILS` | Yes | `shanie@wildvine.com,shanieh@comcast.net` |

---

## Google OAuth Setup

Required for all deployment options.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Navigate to "APIs & Services" → "Credentials"
4. "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://teachassist.vercel.app/api/auth/callback/google` (prod)
7. Copy Client ID and Client Secret

---

## Comparison Table

| Aspect | Railway + Vercel | Render + Vercel | Vercel Only |
|--------|-----------------|-----------------|-------------|
| **Setup time** | 20 min | 25 min | 3-4 hours |
| **Free tier** | Good | Best | Good |
| **Cold start** | 2-5 sec | 30-60 sec | <1 sec |
| **Complexity** | Low | Low | High |
| **Maintenance** | 2 platforms | 2 platforms | 1 platform |
| **Recommended** | ✅ Yes | Backup | Power users |

---

## Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-backend/health`
- [ ] Frontend loads: `https://teachassist.vercel.app`
- [ ] Google sign-in works
- [ ] Only allowed emails can sign in
- [ ] Can upload a document
- [ ] Can ask a question with citations
- [ ] Can consult Inner Council
- [ ] Narratives wizard works

---

## Troubleshooting

### "CORS error" in browser console
Add your Vercel URL to backend CORS:
```python
# backend/api/config.py
cors_origins = ["https://teachassist.vercel.app"]
```

### "Invalid redirect URI" during OAuth
Add the exact Vercel URL to Google Cloud Console authorized redirects.

### Backend not responding
Check Railway/Render logs for startup errors. Common issues:
- Missing `TA_ANTHROPIC_API_KEY`
- Missing `TA_OPENAI_API_KEY`
- Wrong `PORT` configuration

### Slow first load (Render free tier)
Free tier spins down after 15 min. First request takes 30-60 sec to wake up.
Consider upgrading to paid tier ($7/month) for always-on.
