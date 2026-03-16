# VerbalQ Deployment Guide

This guide covers deploying the full-stack application to Render (Backend & ML Service) and Vercel (Frontend).

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Vercel    │─────▶│    Render    │─────▶│   Render    │
│  Frontend   │      │   Backend    │      │ ML Service  │
│  (Next.js)  │      │  (Node.js)   │      │  (FastAPI)  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ MongoDB Atlas│
                     │   Database   │
                     └──────────────┘
```

## Prerequisites

1. **Accounts Required:**
   - [Render](https://render.com/) account
   - [Vercel](https://vercel.com/) account  
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
   - GitHub account

2. **Local Setup:**
   - Git installed
   - Code pushed to GitHub repository

---

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Sign up for free
   - Create a new cluster (M0 Free tier is fine)

2. **Configure Database Access**
   - Click "Database Access" in left sidebar
   - Add new database user
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Grant "Read and write to any database" permission

3. **Configure Network Access**
   - Click "Network Access"
   - Add IP Address
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

4. **Get Connection String**
   - Click "Clusters" → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password
   - Replace `<dbname>` with `verbalq`

Example:
```
mongodb+srv://myuser:MyPassword123@cluster0.abc123.mongodb.net/verbalq?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Prepare Backend Environment Variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with production values:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=generate-random-32-char-string
   ML_SERVICE_URL=https://your-ml-service.onrender.com
   CLIENT_URL=https://your-app.vercel.app
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

3. **Deploy to Render**
   - Go to https://render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing `render.yaml`
   - Render will auto-detect the configuration
   - Click "Apply"
   
4. **Set Environment Variables**
   - After blueprint creates the service
   - Go to backend service → Environment
   - Add/Update variables from your `.env` file
   - Click "Save Changes"

5. **Verify Deployment**
   - Wait for deployment to complete (~5 minutes)
   - Click on backend service
   - Open the provided URL
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should show: `{"status": "OK", ...}`

### Option B: Manual Deployment

1. **Create New Web Service**
   - Render Dashboard → New + → Web Service
   - Connect your repository
   - Configure:
     - **Name:** verbalq-backend
     - **Region:** Oregon (or closest to you)
     - **Branch:** main
     - **Root Directory:** backend
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Starter (Free)

2. **Add Environment Variables**
   - Click "Environment" tab
   - Add each variable from `.env` file
   - Click "Save Changes"

3. **Deploy**
   - Click "Create Web Service"
   - Monitor deployment logs
   - Wait for "Live" status

---

## Step 3: Deploy ML Service to Render

### Important Notes About Ollama

The ML service requires Ollama (LLM runner). You have **3 options**:

#### Option 1: Cloud Ollama Service (Recommended for Production)
Use a GPU-enabled cloud service running Ollama:
- [RunPod](https://runpod.io/) with Ollama template
- [Lambda Labs](https://lambdalabs.com/) 
- Self-hosted GPU server

#### Option 2: Render with External Ollama
Deploy ML service on Render but point to external Ollama:

1. **Deploy Ollama separately** (e.g., on RunPod):
   - Create GPU instance
   - Deploy Ollama using their template
   - Get the Ollama API URL
   
2. **Configure ML Service**
   ```bash
   cd ml-service
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   OLLAMA_URL=https://your-ollama-instance.com
   OLLAMA_MODEL=mistral
   PORT=8001
   ```

3. **Deploy to Render**
   - Render Dashboard → New + → Web Service
   - Connect repository
   - Configure:
     - **Name:** verbalq-ml-service
     - **Region:** Oregon (same as backend)
     - **Root Directory:** ml-service
     - **Runtime:** Python
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Instance Type:** Starter
   
4. **Add Environment Variables**
   - OLLAMA_URL: Your Ollama instance URL
   - OLLAMA_MODEL: mistral
   - PORT: 8001

5. **Update Backend**
   - Go back to backend service on Render
   - Update ML_SERVICE_URL to point to new ML service
   - Save and redeploy

#### Option 3: Alternative Approach (Cost-Effective)

Since Ollama requires GPU, consider:

1. **Use Hugging Face Inference API** instead of local Ollama
2. **Modify ML service** to use cloud-based LLM APIs
3. **Keep only grammar/translation** on Render (no GPU needed)

---

## Step 4: Deploy Frontend to Vercel

1. **Prepare Frontend**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://verbalq-backend.onrender.com
   ```

2. **Install Vercel CLI** (Optional)
   ```bash
   npm i -g vercel
   ```

3. **Deploy via Dashboard** (Recommended)
   
   a. **Go to Vercel Dashboard**
      - https://vercel.com/new
      - Click "Import Project"
   
   b. **Import Git Repository**
      - Select "Git" tab
      - Choose your repository
      - Click "Import"
   
   c. **Configure Project**
      - **Framework Preset:** Next.js
      - **Root Directory:** frontend
      - **Build Command:** `pnpm build` (or leave default)
      - **Output Directory:** `.next`
   
   d. **Add Environment Variables**
      - Click "Environment Variables"
      - Add:
        - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
      - Click "Save"
   
   e. **Deploy**
      - Click "Deploy"
      - Wait for build (~3 minutes)
      - Click "Visit" to see your app

4. **Deploy via CLI** (Alternative)
   ```bash
   cd frontend
   vercel --prod
   ```
   
   Follow prompts to configure.

5. **Update Backend CORS**
   - Go to Render backend service
   - Add environment variable:
     - `CLIENT_URL`: `https://your-app.vercel.app`
   - Save and redeploy

---

## Step 5: Post-Deployment Configuration

### 1. Update All URLs

After all services are deployed, update references:

**Backend (.env on Render):**
```env
ML_SERVICE_URL=https://verbalq-ml-service.onrender.com
CLIENT_URL=https://verbalq-frontend.vercel.app
```

**Frontend (.env.local / Vercel):**
```env
NEXT_PUBLIC_API_URL=https://verbalq-backend.onrender.com
```

### 2. Test Integration

1. **Test Backend Health**
   ```
   https://verbalq-backend.onrender.com/api/health
   ```

2. **Test ML Service Health**
   ```
   https://verbalq-ml-service.onrender.com/health
   ```

3. **Test Frontend**
   ```
   https://verbalq-frontend.vercel.app
   ```

4. **Test Full Flow**
   - Register a test user
   - Try grammar check
   - Check browser console for errors

### 3. MongoDB Initial Setup

The first time you run:
- Backend will auto-create indexes
- Admin user needs to be created manually via registration
- Then promote to admin in MongoDB Atlas

---

## Troubleshooting

### Backend Issues

**Problem:** Service crashes on startup
```
Solution: Check Render logs
- Go to service → Logs tab
- Look for error messages
- Common issues:
  - MongoDB URI incorrect
  - Port already in use
  - Missing environment variables
```

**Problem:** Cannot connect to ML service
```
Solution:
1. Verify ML_SERVICE_URL is correct
2. Check ML service health endpoint
3. Ensure both services in same region
4. Check firewall/network settings
```

**Problem:** CORS errors
```
Solution:
1. Verify CLIENT_URL includes https://
2. No trailing slash in URL
3. Restart backend after changing CORS
```

### ML Service Issues

**Problem:** Ollama connection failed
```
Solution:
1. Verify OLLAMA_URL is accessible
2. Test Ollama health: curl https://your-ollama.com/api/tags
3. Ensure model 'mistral' is pulled: ollama pull mistral
4. Check GPU instance is running
```

**Problem:** High latency/timeouts
```
Solution:
1. Increase timeout in mlClient.js (backend)
2. Use closer region for services
3. Consider upgrading Render plan
4. Optimize Ollama instance
```

### Frontend Issues

**Problem:** API calls failing
```
Solution:
1. Check NEXT_PUBLIC_API_URL in Vercel env
2. Verify backend is running
3. Check browser console for CORS errors
4. Test backend URL directly
```

**Problem:** Build fails
```
Solution:
1. Check build logs in Vercel
2. Verify pnpm-lock.yaml committed
3. Clear cache and redeploy
4. Check Node.js version compatibility
```

---

## Cost Optimization

### Free Tier Limits

**Render:**
- Backend: 750 hours/month free (Starter)
- ML Service: 750 hours/month free (Starter)
- Note: Services sleep after 15 min inactivity (free tier)

**Vercel:**
- Frontend: Unlimited deployments
- 100GB bandwidth/month free
- Optimized for Next.js

**MongoDB Atlas:**
- 512MB storage free (M0)
- Shared RAM/CPU

### Keeping Services Awake

Render free services sleep after inactivity. Solutions:

1. **Uptime Robot** (Free)
   - https://uptimerobot.com/
   - Ping endpoints every 5 minutes
   - Prevents sleep

2. **Render Paid Plan** ($7/month)
   - No sleep
   - Faster instances
   - Recommended for production

3. **Cron Job Wake-up**
   - Use GitHub Actions
   - Ping services periodically

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Render/Vercel secret management
- ✅ Rotate JWT_SECRET periodically
- ✅ Use strong passwords

### 2. Database Security
- ✅ Use strong MongoDB password
- ✅ Restrict IP access (when possible)
- ✅ Enable authentication
- ✅ Regular backups (Atlas auto-backup)

### 3. API Security
- ✅ HTTPS everywhere (auto on Render/Vercel)
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Input validation active

### 4. Monitoring
- Set up Render alerts
- Monitor Vercel analytics
- Track error rates
- Watch bandwidth usage

---

## Scaling Considerations

### When to Upgrade

**Backend (Render):**
- > 500 daily active users
- Need faster response times
- Require more RAM
- Consider: Standard plan ($7/mo)

**ML Service:**
- High GPU usage needed
- Multiple concurrent requests
- Consider: GPU instance or cloud LLM

**Frontend (Vercel):**
- > 100GB bandwidth/month
- Need edge functions
- Team collaboration features

### Performance Tips

1. **Enable CDN** (Vercel auto-does this)
2. **Use Redis** for caching (Render Redis)
3. **Database indexing** (already configured)
4. **Optimize images** (use Next.js Image component)
5. **Lazy loading** components

---

## CI/CD Pipeline

### Automatic Deployments

**Render:**
- Push to `main` branch → Auto-deploy backend
- Can disable in service settings

**Vercel:**
- Push to `main` → Auto-deploy frontend
- Preview deployments for PRs

**Best Practices:**
1. Use feature branches
2. Test locally before pushing
3. Use preview deployments
4. Monitor deployment logs
5. Rollback if needed

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor uptime
- Review user feedback

**Monthly:**
- Update dependencies
- Check security advisories
- Review performance metrics
- Backup database (if not automated)

**Quarterly:**
- Major version updates
- Feature planning
- Cost review
- Scaling assessment

### Updates

**Backend:**
```bash
cd backend
npm update
git commit -am "Update dependencies"
git push
# Render auto-deploys
```

**Frontend:**
```bash
cd frontend
pnpm update
git commit -am "Update dependencies"
git push
# Vercel auto-deploys
```

---

## Support Resources

### Documentation
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Community
- [Render Community Forum](https://community.render.com/)
- [Vercel Community](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/render+vercel)

### Monitoring Tools
- [Uptime Robot](https://uptimerobot.com/) - Free uptime monitoring
- [Better Stack](https://betterstack.com/) - Log management
- [Sentry](https://sentry.io/) - Error tracking

---

## Quick Reference

### Service URLs
```
Frontend:  https://your-app.vercel.app
Backend:   https://verbalq-backend.onrender.com
ML Service: https://verbalq-ml-service.onrender.com
Database:  mongodb+srv://...
```

### Key Commands
```bash
# Local testing
cd backend && npm run dev
cd ml-service && python run.py
cd frontend && pnpm dev

# Deployment
git push origin main  # Triggers auto-deploy

# Check logs
# Render: Dashboard → Service → Logs
# Vercel: Dashboard → Project → Deployments → View logs
```

### Environment Variables Summary

**Backend:**
- NODE_ENV
- PORT
- MONGODB_URI
- JWT_SECRET
- ML_SERVICE_URL
- CLIENT_URL

**ML Service:**
- OLLAMA_URL
- OLLAMA_MODEL
- PORT

**Frontend:**
- NEXT_PUBLIC_API_URL

---

## Conclusion

You now have a fully deployed full-stack application!

✅ Backend API on Render  
✅ ML Service on Render (with external Ollama)  
✅ Frontend on Vercel  
✅ MongoDB Atlas database  

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring
3. Configure custom domain (optional)
4. Implement analytics
5. Plan feature roadmap

**Estimated Costs (Free Tier):**
- Backend: $0 (sleeps after inactivity)
- ML Service: $0 (sleeps after inactivity)  
- Frontend: $0 (generous free tier)
- Database: $0 (512MB free)
- **Total: $0/month** (or ~$14/month to prevent sleep)

Good luck with your deployment! 🚀
