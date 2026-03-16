# Deployment Troubleshooting Guide

Common issues and solutions for VerbalQ deployment.

---

## Backend Issues (Render)

### Issue: Service won't start

**Symptoms:**
- Deployment fails
- "Crash looping" in logs
- 502 Bad Gateway

**Diagnosis:**
```bash
# Check Render logs for:
1. Go to service dashboard
2. Click "Logs" tab
3. Look for error messages during startup
```

**Common Causes & Solutions:**

#### 1. MongoDB Connection Failed
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution:**
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access allows 0.0.0.0/0
- Ensure database user password is correct
- Test connection string locally first

#### 2. Missing Environment Variables
```
Error: MONGODB_URI environment variable is not set
```
**Solution:**
- Go to Render dashboard → Environment
- Add all required variables from `.env.example`
- Save and redeploy
- Never use .env file directly on Render

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Remove PORT from environment variables (Render sets it automatically)
- Or change to different port (8080, 3000, etc.)

#### 4. Build Failures
```
Error: npm install failed
```
**Solution:**
- Check package.json syntax
- Verify all dependencies have valid versions
- Try clearing cache: Settings → Clear Cache
- Redeploy

---

### Issue: CORS Errors

**Symptoms:**
- Frontend can't call backend
- Browser console: "Access-Control-Allow-Origin" error
- Requests fail with status 403

**Solution:**
```javascript
// In backend .env on Render:
CLIENT_URL=https://your-app.vercel.app
```

**Checklist:**
- [ ] CLIENT_URL has https:// prefix
- [ ] No trailing slash in URL
- [ ] Exact match with Vercel domain
- [ ] Restarted backend after changing
- [ ] Checked Render logs for CORS middleware errors

**Test:**
```bash
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://your-backend.onrender.com/api/health
```

Should return:
```
Access-Control-Allow-Origin: https://your-app.vercel.app
```

---

### Issue: ML Service Unreachable

**Symptoms:**
- Grammar check fails
- Error: "ML service is unreachable"
- 503 Service Unavailable

**Solution:**

#### 1. Check ML Service Health
```bash
curl https://your-ml-service.onrender.com/health
```

Expected response:
```json
{"status": "OK", "version": "1.0.0"}
```

#### 2. Update Backend Configuration
```env
# In Render backend environment:
ML_SERVICE_URL=https://your-ml-service.onrender.com
```

#### 3. Check Timeout Settings
If ML service is slow:
```javascript
// In backend/services/mlClient.js
timeout: 120000, // Increase to 120s
```

#### 4. Verify Same Region
- Both services should be in same region (e.g., Oregon)
- Reduces latency and timeout issues

---

### Issue: Database Connection Slow

**Symptoms:**
- Queries take > 5 seconds
- Timeouts on first request
- Intermittent connection failures

**Solutions:**

#### 1. Add Connection Options
```javascript
// In config/database.js
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

#### 2. Use MongoDB Atlas Connection Pooling
```env
MONGODB_URI=mongodb+srv://...&maxPoolSize=10&w=majority
```

#### 3. Check Atlas Cluster Location
- Should be closest to Render region
- Oregon (US West) → AWS us-west-2
- Europe → AWS eu-west-1

---

## ML Service Issues (Render)

### Issue: Ollama Connection Failed

**Symptoms:**
- All AI features fail
- Error: "Cannot connect to Ollama"
- 503 LLM_UNAVAILABLE

**Root Cause:**
Ollama requires GPU, which Render Starter doesn't provide.

**Solutions:**

#### Option 1: External GPU Cloud (Recommended)
1. Deploy Ollama on RunPod/Lambda Labs
2. Get Ollama API URL
3. Update ML service env:
   ```env
   OLLAMA_URL=https://your-gpu-instance.com
   ```

#### Option 2: Fallback to Hugging Face
Modify `ollama_client.py` to use Hugging Face API instead:
```python
# Use transformers library directly
from transformers import pipeline
```

#### Option 3: Disable GPU Features
For testing, disable features requiring Ollama:
- Humanize
- AI Detection
Keep working:
- Grammar (LanguageTool)
- Translation (MarianMT)

---

### Issue: Python Dependencies Fail

**Symptoms:**
- Build fails at pip install
- "No matching distribution found"
- Version conflicts

**Solutions:**

#### 1. Pin Versions in requirements.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
```

#### 2. Clear Build Cache
Render Dashboard → Settings → Clear Cache

#### 3. Use Python 3.10
```env
# In Render environment variables:
PYTHON_VERSION=3.10.0
```

---

### Issue: CUDA/GPU Errors

**Symptoms:**
- Ollama crashes
- "CUDA out of memory"
- "GPU not found"

**Reality Check:**
Render Starter plan doesn't have GPU. You need:

**Option A: GPU Cloud Service**
- RunPod.io (~$0.70/hour)
- Lambda Labs (~$0.50/hour)
- Vast.ai (~$0.40/hour)

**Option B: CPU-Only Models**
Use smaller models that work on CPU:
```env
OLLAMA_MODEL=tinyllama
```

**Option C: Cloud APIs**
Replace Ollama with:
- OpenAI API
- Anthropic API  
- Hugging Face Inference

---

## Frontend Issues (Vercel)

### Issue: Build Fails

**Symptoms:**
- Vercel deployment fails
- "Build failed" in logs
- Exit code 1

**Common Causes:**

#### 1. Missing Dependencies
```
Error: Module not found: Can't resolve 'axios'
```
**Solution:**
```bash
cd frontend
pnpm add axios
git commit -am "Add missing dependency"
git push
```

#### 2. TypeScript Errors
```
Error: Type 'X' is not assignable to type 'Y'
```
**Solution:**
```bash
pnpm build  # Test build locally
# Fix type errors
git push
```

#### 3. Wrong Root Directory
**Solution:**
- Vercel → Project → Settings
- Set Root Directory: `frontend`
- Redeploy

---

### Issue: API Calls Fail (404/500)

**Symptoms:**
- Frontend loads but features don't work
- Network tab shows 404 or 500 errors
- "Network Error" in console

**Solutions:**

#### 1. Check API URL
```env
# In Vercel environment variables:
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

⚠️ **Important:**
- Must include `https://`
- No trailing slash
- Exact domain name

#### 2. Rebuild Frontend
Environment variables are baked in at build time:
- Vercel → Project → Deployments
- Click "Redeploy" on latest deployment
- Or push new commit to trigger rebuild

#### 3. Test Locally
```bash
cd frontend
pnpm build
pnpm serve
# Test with production build
```

---

### Issue: Page Shows 404

**Symptoms:**
- Vercel shows 404 page
- Works locally but not on Vercel

**Solutions:**

#### 1. Check next.config.mjs
```javascript
module.exports = {
  output: 'standalone',
}
```

#### 2. Verify Routes
- Check `app/` directory structure
- Ensure `page.tsx` files exist
- Dynamic routes use `[param]` syntax

#### 3. Clear Vercel Cache
```bash
vercel pull  # Pull project
vercel --prod  # Force redeploy
```

---

## MongoDB Atlas Issues

### Issue: Authentication Failed

**Symptoms:**
- "Authentication failed"
- "Bad auth mechanism"
- "User not found"

**Solutions:**

#### 1. Check Username/Password
- No special characters in password (or URL-encode them)
- Case-sensitive username
- Copy-paste without extra spaces

#### 2. Verify Database User
Atlas Dashboard → Database Access:
- User exists
- Has "Read and write to any database" permission
- Password matches

#### 3. Connection String Format
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/verbalq?retryWrites=true&w=majority
```

URL-encode special characters:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

---

### Issue: Network Timeout

**Symptoms:**
- "getaddrinfo ENOTFOUND"
- "Network timeout"
- Can't connect to cluster

**Solutions:**

#### 1. Check Network Access
Atlas → Network Access:
- Add IP Address
- Select "Allow Access from Anywhere" (0.0.0.0/0)
- Confirm

#### 2. DNS Issues
Try Google DNS:
```
8.8.8.8
8.8.4.4
```

#### 3. Firewall Blocking
- Check local firewall
- Corporate proxy may block MongoDB
- Try from different network

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms:**
- API calls take > 5 seconds
- First request very slow
- Timeouts

**Solutions:**

#### 1. Cold Start (Free Tier)
Render free services sleep after 15 min inactivity.

**Fix:**
- Upgrade to Standard plan ($7/mo), OR
- Use Uptime Robot to ping every 5 min

#### 2. Database Indexing
Already configured in History model:
```javascript
historySchema.index({ userId: 1, createdAt: -1 });
```

#### 3. Optimize Queries
```javascript
// Only fetch needed fields
.select('-__v')
// Limit results
.limit(10)
// Use pagination
.skip((page - 1) * limit)
```

---

### Issue: High Memory Usage

**Symptoms:**
- Service restarts frequently
- "Out of memory" errors
- Crashes under load

**Solutions:**

#### 1. Monitor Memory
Render Dashboard → Metrics → Memory

#### 2. Optimize Code
- Stream large responses
- Don't load entire files into memory
- Use pagination

#### 3. Upgrade Plan
Starter: 512MB RAM → Standard: 2GB RAM

---

## Security Issues

### Issue: Unauthorized Access Attempts

**Symptoms:**
- Failed login attempts in logs
- Suspicious API calls
- Rate limit triggered

**Solutions:**

#### 1. Strengthen JWT
```env
JWT_SECRET=<use-64-char-random-string>
```

Generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Enable Rate Limiting
Already configured in `middleware/rateLimit.js`

#### 3. MongoDB User Permissions
Create separate users:
- App user: Read/write own data only
- Admin user: Full access

---

## Rollback Procedures

### Rollback Backend (Render)

1. **Via Dashboard:**
   - Render → Service → Deploys
   - Click previous successful deployment
   - Click "Rollback to this deploy"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

### Rollback Frontend (Vercel)

1. **Via Dashboard:**
   - Vercel → Project → Deployments
   - Click previous deployment
   - Click "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

---

## Getting Help

### Logs & Monitoring

**Render:**
- Dashboard → Service → Logs (real-time)
- Dashboard → Service → Events (deployment history)

**Vercel:**
- Dashboard → Project → Deployments → View Logs
- Or: `vercel logs <deployment-url>`

**MongoDB:**
- Atlas → Clusters → Logs

### Support Channels

1. **Render Community:** https://community.render.com/
2. **Vercel GitHub:** https://github.com/vercel/next.js/discussions
3. **MongoDB Forums:** https://www.mongodb.com/community/forums/

### When Creating Support Ticket

Include:
- [ ] Service URLs
- [ ] Error messages (full text)
- [ ] Timestamp of issue
- [ ] What you were trying to do
- [ ] What you expected vs what happened
- [ ] Relevant log excerpts
- [ ] Steps to reproduce

---

## Emergency Contacts

**Critical Issues (Service Down):**
1. Check status pages:
   - https://status.render.com/
   - https://www.vercel-status.com/
   - https://status.atlassian.com/ (MongoDB)

2. If platform-wide outage:
   - Wait for resolution
   - Monitor status pages
   - Don't make configuration changes

3. If your service only:
   - Check logs immediately
   - Recent deployment? Rollback
   - Configuration change? Revert
   - Contact support with details

---

**Last Updated:** 2026-03-10  
**Maintained By:** Development Team
