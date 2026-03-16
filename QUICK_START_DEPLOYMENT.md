# Quick Start Deployment Guide 🚀

**TL;DR:** Deploy VerbalQ in 30 minutes using this step-by-step guide.

---

## Overview

You're deploying:
- ✅ **Frontend** (Next.js) → Vercel
- ✅ **Backend** (Node.js) → Render  
- ✅ **ML Service** (FastAPI) → Render
- ✅ **Database** (MongoDB) → MongoDB Atlas

**Total Cost:** $0/month (free tier, services sleep) or $14/month (always on)

---

## Step-by-Step (30 Minutes)

### Minute 0-5: MongoDB Atlas Setup

1. **Go to** https://cloud.mongodb.com/
2. **Sign up** (free)
3. **Create Cluster:**
   - Click "Build a Database"
   - Choose "M0 FREE"
   - Select region closest to you
   - Click "Create"
   
4. **Create User:**
   - Click "Database Access"
   - "Add New Database User"
   - Username: `verbalqadmin`
   - Password: (save this!)
   - Role: "Atlas admin"
   - Click "Add User"

5. **Allow Network Access:**
   - Click "Network Access"
   - "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

6. **Get Connection String:**
   - Click "Database"
   - Click "Connect" on your cluster
   - "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `verbalq`

Example:
```
mongodb+srv://verbalqadmin:MyPass123@cluster0.abc123.mongodb.net/verbalq?retryWrites=true&w=majority
```

---

### Minute 5-15: Deploy Backend to Render

1. **Prepare .env file:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<paste-your-mongodb-uri>
   JWT_SECRET=<generate-random-string-here>
   ML_SERVICE_URL=https://placeholder-ml.onrender.com
   CLIENT_URL=https://placeholder.vercel.app
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy on Render:**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Select `render.yaml`
   - Click "Apply"
   - Wait (~5 minutes)

4. **Update Environment Variables:**
   - Click on backend service
   - Go to "Environment" tab
   - Update variables from your `.env`
   - Click "Save Changes"
   - Service will redeploy

5. **Test:**
   Visit: `https://your-backend.onrender.com/api/health`
   
   Should show:
   ```json
   {"status":"OK","uptime":"0h 0m 30s",...}
   ```

---

### Minute 15-20: Deploy ML Service (Simplified)

**⚠️ IMPORTANT:** The ML service needs Ollama (GPU). For now, we'll deploy without GPU features.

1. **Modify for CPU-only (temporary):**
   
   Edit `ml-service/app/services/ollama_client.py`:
   - Comment out Ollama calls
   - Use simple fallback responses
   
   OR skip ML service deployment for now and update backend to use mock responses.

2. **Alternative: Deploy without Ollama**
   
   Skip ML service initially. Test backend/frontend first. Add ML service later when you have GPU cloud setup.

---

### Minute 20-30: Deploy Frontend to Vercel

1. **Prepare frontend:**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select "Git" → Your repository
   - Click "Import"
   
3. **Configure:**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `pnpm build`
   
4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
   - Click "Save"
   
5. **Deploy:**
   - Click "Deploy"
   - Wait (~3 minutes)
   
6. **Test:**
   Visit: `https://your-app.vercel.app`

---

## Post-Deployment (5 Minutes)

### 1. Update Backend URLs

Render Dashboard → Backend → Environment:
```env
CLIENT_URL=https://your-new-vercel-app.vercel.app
```

Click "Save Changes" → Redeploy

### 2. Test Everything

✅ **Checklist:**
- [ ] Backend health: `/api/health`
- [ ] Frontend loads
- [ ] Register user works
- [ ] Login works
- [ ] Grammar check (if ML service running)
- [ ] No console errors

### 3. Keep Services Awake (Optional)

Free tier services sleep after 15 min. To prevent:

**Option A: Uptime Robot (Free)**
1. Go to https://uptimerobot.com/
2. Create account
3. Add monitors:
   - `https://backend.onrender.com/api/health`
   - Check every 5 minutes
4. Services stay awake!

**Option B: Upgrade Render ($7/month each)**
- Render → Service → Settings
- Change to "Standard" plan
- No sleep, faster performance

---

## What's Next?

### Phase 1: Get It Working ✅
- [x] Follow this guide
- [x] Test basic functionality
- [x] Fix any issues (see TROUBLESHOOTING.md)

### Phase 2: Add ML Service
Once backend/frontend work:

1. **Get GPU Cloud:**
   - RunPod.io (recommended)
   - Deploy Ollama template
   - Get API URL

2. **Deploy ML Service:**
   - Use `render-ml.yaml`
   - Set OLLAMA_URL
   - Test endpoints

3. **Update Backend:**
   - Change ML_SERVICE_URL
   - Test AI features

### Phase 3: Production Ready
- [ ] Custom domain
- [ ] SSL certificates (automatic)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Backup strategy
- [ ] Monitoring alerts

---

## Common Issues & Quick Fixes

### ❌ Backend won't start
```
Fix: Check Render logs
Dashboard → Service → Logs
Look for error message
Usually: Missing env variable or bad MongoDB URI
```

### ❌ CORS errors
```
Fix: Update CLIENT_URL in backend
Must be: https://exact-domain.vercel.app
No trailing slash!
```

### ❌ "Cannot connect to ML service"
```
Expected! ML service needs GPU.
Either:
1. Skip for now (use placeholder)
2. Deploy Ollama on RunPod first
3. Modify to use cloud LLM API
```

### ❌ Frontend shows 404
```
Fix: Check Root Directory in Vercel
Should be: frontend
Not: / (root)
```

---

## Costs Breakdown

### Free Tier (Sleeps)
```
Backend:     $0/mo  ⚠️ Sleeps after 15min
ML Service:  $0/mo  ⚠️ Sleeps after 15min  
Frontend:    $0/mo  ✅ Always on
Database:    $0/mo  ✅ 512MB free
─────────────────────────────
Total:       $0/mo  (but sleeps)
```

### Recommended ($14/mo)
```
Backend:     $7/mo  ✅ Always on
ML Service:  $7/mo  ✅ Always on
Frontend:    $0/mo  ✅ Unlimited
Database:    $0/mo  ✅ Free tier sufficient
─────────────────────────────
Total:       $14/mo (no sleep)
```

### Production (~$140/mo)
```
Backend Std:    $7/mo
ML GPU Server:  $70/mo (RunPod)
Database M10:   $60/mo
Frontend Pro:   $20/mo (optional)
─────────────────────────────
Total:          ~$157/mo
```

---

## Success Checklist

### Deployment Complete When:
- [ ] ✅ Backend responds at `/api/health`
- [ ] ✅ Frontend loads at vercel.app domain
- [ ] ✅ Can register new user
- [ ] ✅ Can login successfully
- [ ] ✅ Dashboard accessible
- [ ] ✅ No console errors
- [ ] ✅ MongoDB connected (check Atlas dashboard)

### Nice to Have:
- [ ] ⭐ Uptime monitoring setup
- [ ] ⭐ Custom domain configured
- [ ] ⭐ Error tracking enabled
- [ ] ⭐ Analytics installed
- [ ] ⭐ ML service with GPU working

---

## Need Help?

### Documentation:
- 📖 **Full Guide:** DEPLOYMENT_GUIDE.md
- ✅ **Checklist:** DEPLOYMENT_CHECKLIST.md  
- 🔧 **Troubleshooting:** TROUBLESHOOTING.md

### Support:
- Render Community: https://community.render.com/
- Vercel GitHub: https://github.com/vercel/next.js/discussions
- MongoDB Forums: https://www.mongodb.com/community/forums/

### Emergency:
If stuck > 30 minutes:
1. Take a break
2. Review logs carefully
3. Try rollback to last working state
4. Ask for help with:
   - Service URLs
   - Error messages
   - What you tried
   - Screenshots

---

## Quick Reference

### Your URLs (Fill In):
```
Frontend:    https://____________________.vercel.app
Backend:     https://____________________.onrender.com
ML Service:  https://____________________.onrender.com
Database:    mongodb+srv://____________________
```

### Key Commands:
```bash
# Test locally
cd backend && npm run dev
cd frontend && pnpm dev

# Deploy
git push origin main

# View logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → View Logs
```

---

## Congratulations! 🎉

Once everything is deployed and tested:

✅ You have a production-ready full-stack app  
✅ Users can sign up and use AI text tools  
✅ Scalable architecture  
✅ Professional deployment  

**Share your success!**
- Update README.md with live URLs
- Share with team/stakeholders
- Plan next features
- Celebrate! 🥳

---

**Estimated Time:** 30-45 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** $0-14/month to start  

**You got this! 💪**

---

Last Updated: 2026-03-10
