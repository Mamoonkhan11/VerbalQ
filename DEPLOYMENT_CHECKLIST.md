# Deployment Checklist ✓

## Pre-Deployment Preparation

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (M0 Free tier)
- [ ] Create database user with password
- [ ] Configure network access (0.0.0.0/0)
- [ ] Get connection string
- [ ] Test connection locally

### 2. GitHub Repository
- [ ] Create GitHub repository
- [ ] Push code to main branch
- [ ] Verify all files committed
- [ ] Check .gitignore is correct

---

## Backend Deployment (Render)

### Files Created
- [ ] `backend/.env` with production values
- [ ] `render.yaml` in root directory

### Environment Variables
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] MONGODB_URI=<your-mongodb-connection-string>
- [ ] JWT_SECRET=<generate-32-char-random-string>
- [ ] ML_SERVICE_URL=<ml-service-url>
- [ ] CLIENT_URL=<frontend-url>

### Deployment Steps
- [ ] Go to render.com
- [ ] New + → Blueprint
- [ ] Connect GitHub repository
- [ ] Select render.yaml
- [ ] Click Apply
- [ ] Wait for deployment (~5 min)
- [ ] Test health endpoint: `/api/health`

---

## ML Service Deployment (Render)

### Prerequisites
- [ ] Decide Ollama hosting strategy:
  - [ ] Option 1: External GPU cloud (RunPod, Lambda Labs)
  - [ ] Option 2: Render with external Ollama
  - [ ] Option 3: Modify to use cloud LLM API

### Files Created
- [ ] `ml-service/.env` with Ollama URL
- [ ] `render-ml.yaml` in root directory

### Environment Variables
- [ ] OLLAMA_URL=<your-ollama-instance>
- [ ] OLLAMA_MODEL=mistral
- [ ] PORT=8001

### Deployment Steps
- [ ] Render Dashboard → New + → Web Service
- [ ] Connect repository
- [ ] Root Directory: ml-service
- [ ] Build: `pip install -r requirements.txt`
- [ ] Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables
- [ ] Deploy and wait (~5 min)
- [ ] Test health endpoint: `/health`

---

## Frontend Deployment (Vercel)

### Files Created
- [ ] `frontend/.env.local` with backend URL
- [ ] `frontend/vercel.json` configuration

### Environment Variables
- [ ] NEXT_PUBLIC_API_URL=<backend-render-url>

### Deployment Steps
- [ ] Go to vercel.com/new
- [ ] Import Git repository
- [ ] Configure:
  - [ ] Framework: Next.js
  - [ ] Root Directory: frontend
  - [ ] Build Command: pnpm build
- [ ] Add environment variables
- [ ] Deploy and wait (~3 min)
- [ ] Test frontend loads

---

## Post-Deployment Configuration

### Update URLs
- [ ] Update backend ML_SERVICE_URL with actual ML service URL
- [ ] Update backend CLIENT_URL with actual Vercel URL
- [ ] Redeploy backend if needed

### Integration Testing
- [ ] Test backend health: `/api/health`
- [ ] Test ML service health: `/health`
- [ ] Test frontend loads
- [ ] Register test user
- [ ] Test grammar check feature
- [ ] Test translation feature
- [ ] Test humanize feature (if Ollama working)
- [ ] Test plagiarism check
- [ ] Test AI detection
- [ ] Check browser console for errors

### Database Setup
- [ ] Verify MongoDB connection
- [ ] Check collections created
- [ ] Create admin user via registration
- [ ] Promote to admin in MongoDB Atlas

---

## Security Hardening

### Credentials
- [ ] All .env files in .gitignore
- [ ] Strong passwords used
- [ ] JWT_SECRET is random 32+ chars
- [ ] MongoDB password secure

### Network
- [ ] CORS configured correctly
- [ ] HTTPS enforced (automatic on platforms)
- [ ] Rate limiting active
- [ ] Input validation working

---

## Monitoring Setup

### Uptime Monitoring
- [ ] Set up Uptime Robot (free)
  - [ ] Monitor backend: https://<backend>.onrender.com/api/health
  - [ ] Monitor ML service: https://<ml-service>.onrender.com/health
  - [ ] Monitor frontend: https://<frontend>.vercel.app
  - [ ] Check every 5 minutes
  - [ ] Email alerts enabled

### Logs
- [ ] Bookmark Render backend logs
- [ ] Bookmark Render ML service logs
- [ ] Bookmark Vercel deployment logs
- [ ] Set up error tracking (optional: Sentry)

---

## Performance Optimization

### Keep Services Awake (Optional - Paid)
- [ ] Upgrade Render backend to Standard ($7/mo)
- [ ] Upgrade Render ML service to Standard ($7/mo)
- [ ] Or set up Uptime Robot pings every 5 min

### CDN & Caching
- [ ] Vercel CDN auto-enabled
- [ ] Consider Redis for caching (future)
- [ ] Enable MongoDB Atlas performance insights

---

## Documentation

### Team Handoff
- [ ] Share DEPLOYMENT_GUIDE.md with team
- [ ] Document all URLs
- [ ] Share credentials securely (1Password, LastPass)
- [ ] Create runbook for common issues

### User Documentation
- [ ] Update README.md with live URLs
- [ ] Add screenshots
- [ ] Document known issues
- [ ] Create FAQ

---

## Go-Live Approval

### Final Checks
- [ ] All features tested and working
- [ ] No critical errors in logs
- [ ] Uptime monitoring active
- [ ] Backup strategy confirmed
- [ ] Rollback plan documented

### Stakeholder Sign-off
- [ ] Product owner approval
- [ ] Technical lead approval
- [ ] Security review (if applicable)

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor daily for errors
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Fix any critical bugs

### Month 1
- [ ] Review cost vs budget
- [ ] Analyze usage patterns
- [ ] Plan feature roadmap
- [ ] Schedule maintenance window

### Ongoing
- [ ] Weekly: Check logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Review architecture
- [ ] As needed: Scale resources

---

## Quick Reference

### Service URLs
```
Frontend:    https://____________________.vercel.app
Backend:     https://____________________.onrender.com
ML Service:  https://____________________.onrender.com
Database:    mongodb+srv://____________________
```

### Key Contacts
```
Render Support:   https://community.render.com/
Vercel Support:   https://github.com/vercel/next.js/discussions
MongoDB Support:  https://support.mongodb.com/
```

### Emergency Procedures
```
If backend down:
1. Check Render logs
2. Restart service from dashboard
3. Check MongoDB connection
4. Review recent deployments

If ML service down:
1. Check Ollama instance running
2. Verify OLLAMA_URL accessible
3. Restart ML service
4. Check GPU resources

If frontend down:
1. Check Vercel deployment status
2. Review build logs
3. Check API connectivity
4. Rollback if needed
```

---

## Estimated Costs

### Free Tier (Services Sleep)
- Backend: $0 (sleeps after 15 min)
- ML Service: $0 (sleeps after 15 min)
- Frontend: $0 (unlimited)
- Database: $0 (512MB free)
- **Total: $0/month** ⚠️ Services will sleep

### Starter Plan (No Sleep)
- Backend: $7/month
- ML Service: $7/month
- Frontend: $0
- Database: $0
- **Total: $14/month** ✅ Always awake

### Production Ready
- Backend Standard: $7/month
- ML Service GPU: ~$50-100/month (varies by GPU)
- Frontend Pro: $20/month (if needed)
- Database M10: ~$60/month
- **Total: ~$137-187/month** 🚀 Full production

---

**Status:** [ ] Not Started  [ ] In Progress  [ ] Complete  
**Last Updated:** ________________  
**Deployed By:** ________________
