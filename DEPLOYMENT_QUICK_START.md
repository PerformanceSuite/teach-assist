# 🚀 Deploy TeachAssist to Vercel - Quick Start

**Time to deploy:** ~5 minutes for frontend, ~10 minutes for backend

---

## Step 1: Deploy Backend (Choose One Platform)

### Option A: Fly.io (Recommended - Free Tier)

```bash
# Install Fly CLI (Mac/Linux)
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Navigate to backend
cd backend

# Login and launch
fly auth login
fly launch

# Set API key
fly secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy
fly deploy

# Get your URL
fly info
# Example: https://teachassist-api.fly.dev
```

---

### Option B: Railway (Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign up / Login
3. **New Project** → **Deploy from GitHub**
4. Select: `teach-assist` repo → `backend` folder
5. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
6. **Deploy**
7. Copy the URL from Railway dashboard
   - Example: `https://teachassist-production.up.railway.app`

---

## Step 2: Deploy Frontend to Vercel

### Via GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com/new)
2. **Import Git Repository**
3. Select: `teach-assist`
4. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Add Environment Variable:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL (from Step 1)
   - Example: `https://teachassist-api.fly.dev`
6. **Deploy** 🚀
7. Wait ~2 minutes
8. Your app is live! 🎉
   - Example: `https://teach-assist.vercel.app`

---

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# When prompted:
# - Link to existing project? No (first time)
# - Project name: teach-assist
# - Add environment variable: NEXT_PUBLIC_API_URL
# - Value: https://your-backend-api.com

# Done! Your URL: https://teach-assist-[random].vercel.app
```

---

## Step 3: Test Your Deployment

### Backend Health Check

```bash
# Replace with your backend URL
curl https://teachassist-api.fly.dev/health

# Should return:
# {"status":"healthy","version":"0.1.0","services":{"personas":"ok","knowledgebeast":"ok"}}
```

### Frontend Test

1. Open your Vercel URL in browser
2. You should see the Welcome Dashboard
3. Try uploading a document (Sources page)
4. Ask a question (Chat page)
5. Consult council (Council page)

---

## Step 4: Install as PWA (Optional)

### Desktop

**Chrome/Edge:**
- Look for install icon (⊕) in address bar
- Click to install
- TeachAssist opens as standalone app!

**Safari (Mac):**
- File → Add to Dock
- TeachAssist appears in dock

### Mobile

**iOS (Safari):**
1. Tap Share button
2. Scroll to "Add to Home Screen"
3. Tap "Add"
4. Icon appears on home screen

**Android (Chrome):**
1. Tap menu (⋮)
2. Tap "Add to Home Screen"
3. Confirm
4. Icon appears on home screen

---

## 🎉 You're Done!

Your TeachAssist is now:
- ✅ Deployed to Vercel (frontend)
- ✅ Backend API running (Fly.io/Railway/Render)
- ✅ Accessible via web browser
- ✅ Installable as PWA
- ✅ Ready for pilot teachers!

---

## Next Steps

1. **Set Custom Domain (Optional):**
   - Vercel → Project Settings → Domains
   - Add: `teachassist.com` or whatever domain you own
   - Update DNS records (Vercel provides instructions)

2. **Share with Pilot Teachers:**
   - Send them the Vercel URL
   - They can use it immediately (no setup!)
   - Optional: They can install as PWA

3. **Monitor Usage:**
   - Vercel Dashboard: Traffic and performance
   - Backend logs: `fly logs` or Railway/Render dashboard
   - Anthropic Dashboard: API usage and costs

---

## 💰 Cost Estimate

**Vercel (Frontend):** FREE
- Hobby plan includes 100 GB bandwidth
- More than enough for pilot

**Backend (Fly.io/Railway/Render):** FREE - $5/month
- Free tiers cover pilot usage
- May need to upgrade if heavy usage

**Anthropic API:** $5-20/month
- Based on actual usage
- Monitor at console.anthropic.com

**Total: $5-25/month for pilot**

---

## 🐛 Troubleshooting

**"API calls failing"**
→ Check `NEXT_PUBLIC_API_URL` is set in Vercel
→ Verify backend is running (test `/health` endpoint)

**"CORS errors"**
→ Update backend CORS to include your Vercel domain
→ Add to `backend/api/config.py`: `cors_origins = ["https://teach-assist.vercel.app"]`

**"PWA not installing"**
→ Must use HTTPS (Vercel provides this automatically)
→ Check icons exist: `https://your-app.com/icons/icon-192x192.png`
→ Run Lighthouse PWA audit in DevTools

---

## 📚 Full Documentation

For detailed deployment options, troubleshooting, and advanced configuration:
→ See [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)

---

**Questions?** Open an issue on GitHub or check the full deployment guide.

**Ready to deploy?** Start with Step 1 above! 🚀
