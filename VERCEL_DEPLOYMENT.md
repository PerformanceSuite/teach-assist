# TeachAssist - Vercel Deployment Guide

Complete guide for deploying TeachAssist frontend to Vercel with PWA support.

---

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with GitHub (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add -A
   git commit -m "feat: Add PWA and Vercel configuration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `teach-assist`
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   - Add: `NEXT_PUBLIC_API_URL`
   - Value: Your backend API URL (see Backend Deployment section below)
   - Example: `https://teachassist-api.fly.io` or `https://your-backend.railway.app`

4. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes for build
   - Your app will be live at: `https://teach-assist-[random].vercel.app`

5. **Set Custom Domain (Optional):**
   - Project Settings → Domains
   - Add your custom domain: `teachassist.com`
   - Follow DNS instructions

---

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set project name: teach-assist
# - Link to existing project or create new
# - Set environment variable: NEXT_PUBLIC_API_URL

# Your app will be deployed!
```

---

## 🔧 Backend Deployment

**Important:** The backend (Python FastAPI) must be deployed separately from the frontend.

### Recommended Options:

#### Option A: Fly.io (Recommended - Free Tier Available)

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Navigate to backend:**
   ```bash
   cd backend
   ```

3. **Create Fly app:**
   ```bash
   fly launch
   # Follow prompts:
   # - App name: teachassist-api
   # - Region: Choose closest to you
   # - Database: No (we're using in-memory)
   ```

4. **Set environment variable:**
   ```bash
   fly secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

6. **Get your API URL:**
   ```bash
   fly info
   # Look for: Hostname: teachassist-api.fly.dev
   # Your API_URL: https://teachassist-api.fly.dev
   ```

7. **Update Vercel:**
   - Go to Vercel project settings
   - Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to: `https://teachassist-api.fly.dev`
   - Redeploy frontend

---

#### Option B: Railway (Easy Deploy)

1. **Sign up:** [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. **Select backend folder**
4. **Add environment variable:** `ANTHROPIC_API_KEY`
5. **Deploy** - Railway will auto-detect Python
6. **Get URL:** `https://your-app.railway.app`
7. **Update Vercel** with this URL

---

#### Option C: Render (Free Tier)

1. **Sign up:** [render.com](https://render.com)
2. **New Web Service**
3. **Connect GitHub repo**
4. **Root Directory:** `backend`
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
7. **Add environment variable:** `ANTHROPIC_API_KEY`
8. **Deploy**
9. **Get URL** and update Vercel

---

#### Option D: Self-Hosted (Advanced)

Deploy to your own server with Docker:

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8002
EXPOSE 8002

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

Deploy:
```bash
cd backend
docker build -t teachassist-backend .
docker run -d -p 8002:8002 -e ANTHROPIC_API_KEY=sk-ant-... teachassist-backend
```

---

## 📱 PWA Configuration

### PWA is automatically enabled when deployed to Vercel!

**Features:**
- ✅ Installable on desktop and mobile
- ✅ Offline support (caches pages and assets)
- ✅ App-like experience (no browser chrome)
- ✅ Home screen shortcuts (Upload, Chat, Council)
- ✅ Fast loading with service worker caching

### Testing PWA Locally:

```bash
# Build production version
npm run build
npm start

# Open: http://localhost:3000
# Open DevTools → Application → Manifest
# Check: PWA installability
```

### Installing PWA:

**Desktop (Chrome/Edge):**
- Click install icon in address bar
- Or: Menu → Install TeachAssist

**Mobile (iOS Safari):**
- Tap Share button
- Scroll to "Add to Home Screen"
- Tap "Add"

**Mobile (Android Chrome):**
- Tap menu (three dots)
- Tap "Add to Home Screen"
- Confirm

---

## 🎨 PWA Icons (TODO)

**Currently:** Icon placeholders exist but need actual images.

**To add custom icons:**

1. **Create a 512x512 PNG icon** for TeachAssist
   - Background: Slate 900 (#0f172a)
   - Accent: Indigo 600 (#4f46e5)
   - Symbol: Graduation cap or book
   - Style: Clean, professional, education-focused

2. **Generate all sizes:**
   ```bash
   # Using ImageMagick
   cd public/icons
   convert icon-512x512.png -resize 72x72 icon-72x72.png
   convert icon-512x512.png -resize 96x96 icon-96x96.png
   convert icon-512x512.png -resize 128x128 icon-128x128.png
   convert icon-512x512.png -resize 144x144 icon-144x144.png
   convert icon-512x512.png -resize 152x152 icon-152x152.png
   convert icon-512x512.png -resize 192x192 icon-192x192.png
   convert icon-512x512.png -resize 384x384 icon-384x384.png
   ```

3. **Or use online tool:**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

4. **Commit and redeploy:**
   ```bash
   git add public/icons/
   git commit -m "Add TeachAssist PWA icons"
   git push origin main
   ```

---

## 🔒 Environment Variables

### Vercel (Frontend)

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Your backend API URL | ✅ Yes |

**How to set:**
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add `NEXT_PUBLIC_API_URL`
4. Value: `https://your-backend-api.com`
5. Select: Production, Preview, Development
6. Save & Redeploy

---

### Backend (Any Platform)

| Variable | Value | Required |
|----------|-------|----------|
| `ANTHROPIC_API_KEY` | sk-ant-... | ✅ Yes |
| `LOG_LEVEL` | INFO | ❌ No (default: INFO) |
| `ALLOWED_ORIGINS` | https://teach-assist.vercel.app | ❌ No (default: *) |

**How to set (varies by platform):**

**Fly.io:**
```bash
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly secrets set ALLOWED_ORIGINS=https://teach-assist.vercel.app
```

**Railway:**
- Dashboard → Variables
- Add key-value pairs

**Render:**
- Dashboard → Environment
- Add key-value pairs

---

## 🔍 Verifying Deployment

### Frontend Health Check:

```bash
# Visit your Vercel URL
curl https://teach-assist.vercel.app

# Should return HTML
```

### Backend Health Check:

```bash
# Visit your backend URL
curl https://your-backend-api.com/health

# Should return:
# {"status":"healthy","version":"0.1.0","services":{"personas":"ok","knowledgebeast":"ok"}}
```

### PWA Check:

1. Open deployed app in browser
2. DevTools → Lighthouse
3. Run "Progressive Web App" audit
4. Should score 90+ (with icons)

### End-to-End Test:

1. Visit deployed app
2. Upload a document (Sources page)
3. Ask a question (Chat page)
4. Consult council (Council page)
5. All should work without errors

---

## 🐛 Troubleshooting

### Issue: "NEXT_PUBLIC_API_URL is not defined"

**Symptom:** Frontend can't reach backend, API calls fail

**Fix:**
1. Check Vercel environment variables
2. Ensure `NEXT_PUBLIC_API_URL` is set
3. Redeploy: `vercel --prod` or push to GitHub

---

### Issue: Backend returns 404

**Symptom:** API calls return "Not Found"

**Fix:**
1. Verify backend is deployed and running
2. Check backend URL is correct
3. Test directly: `curl https://your-backend-api.com/health`
4. Check CORS settings in backend

---

### Issue: CORS errors

**Symptom:** Browser console shows CORS policy errors

**Fix:**

Add to `backend/api/config.py`:

```python
cors_origins = [
    "https://teach-assist.vercel.app",
    "https://teach-assist-*.vercel.app",  # Preview deployments
    "http://localhost:3000",  # Local development
]
```

Redeploy backend.

---

### Issue: PWA not installing

**Symptom:** No install prompt appears

**Checklist:**
- ✅ App is served over HTTPS (Vercel does this automatically)
- ✅ `manifest.json` exists and is valid
- ✅ Icons exist in `public/icons/`
- ✅ Service worker is registered
- ✅ PWA audit passes (Lighthouse)

**Fix:**
1. Check DevTools → Application → Manifest
2. Look for errors
3. Verify icons load: `https://your-app.com/icons/icon-192x192.png`
4. Check service worker: DevTools → Application → Service Workers

---

### Issue: Old content cached

**Symptom:** Changes don't appear after deployment

**Fix:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear site data: DevTools → Application → Clear Storage
3. Unregister service worker: DevTools → Application → Service Workers → Unregister
4. Refresh page

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

Automatically enabled! View in Vercel Dashboard:
- Page views
- Load times
- Core Web Vitals
- Real user monitoring

### Add Custom Analytics (Optional)

**PostHog (Privacy-Friendly):**

```bash
npm install posthog-js
```

Add to `app/layout.tsx`:

```typescript
import posthog from 'posthog-js'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com'
  })
}
```

**Plausible (Privacy-Friendly):**

Add to `app/layout.tsx`:

```tsx
<head>
  <script defer data-domain="teachassist.com" src="https://plausible.io/js/script.js"></script>
</head>
```

---

## 💰 Cost Estimates

### Vercel (Frontend)

**Hobby Plan (Free):**
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions (limited)

**Cost:** FREE for pilot

**Pro Plan ($20/month):**
- Needed if: >100 GB bandwidth or >1000 serverless function invocations/day
- Not needed for pilot phase

---

### Backend Hosting

**Fly.io:**
- Free tier: 3 shared-cpu-1x VMs
- Cost: FREE for pilot (stay under limits)
- Upgrade: ~$5-10/month if needed

**Railway:**
- Free tier: $5 credit/month
- Cost: FREE for pilot
- Upgrade: Pay as you go (~$5-15/month)

**Render:**
- Free tier: 750 hours/month
- Cost: FREE for pilot
- Upgrade: $7/month for paid tier

**Total Pilot Cost: $0-5/month** (just Anthropic API usage)

---

## 🚀 Deployment Checklist

Before deploying to production:

### Pre-Deployment

- [ ] Backend deployed and tested
- [ ] Frontend environment variables set
- [ ] API health check passes
- [ ] CORS configured correctly
- [ ] Icons added (or placeholders acceptable)
- [ ] Error tracking set up (optional)

### Post-Deployment

- [ ] Frontend loads successfully
- [ ] Document upload works
- [ ] Chat/RAG works
- [ ] Inner Council works
- [ ] PWA installs successfully
- [ ] Mobile responsive (test on real device)
- [ ] All keyboard shortcuts work
- [ ] Help Center loads

### Production Readiness

- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] Monitoring alerts set up
- [ ] Backup strategy for backend data
- [ ] Pilot teachers invited
- [ ] Support email/channel ready

---

## 🎓 Next Steps After Deployment

1. **Test with pilot teachers:**
   - Send them the deployed URL
   - Walk through setup (no local install needed!)
   - Gather feedback on performance

2. **Monitor usage:**
   - Check Vercel analytics
   - Monitor API costs (Anthropic dashboard)
   - Track errors (Vercel logs)

3. **Iterate:**
   - Fix bugs reported by pilots
   - Improve performance based on metrics
   - Add features based on feedback

4. **Scale:**
   - Upgrade plans if needed
   - Add database for conversation history
   - Implement authentication (v0.2)

---

## 📞 Support

**Deployment Issues:**
- Vercel: [vercel.com/support](https://vercel.com/support)
- Fly.io: [fly.io/docs](https://fly.io/docs)
- Railway: [railway.app/help](https://railway.app/help)

**TeachAssist Issues:**
- GitHub: [github.com/PerformanceSuite/teach-assist/issues](https://github.com/PerformanceSuite/teach-assist/issues)

---

**Ready to deploy?** Start with the Quick Deploy section above!

**Last Updated:** 2026-01-25
**Version:** v0.1 Pilot
