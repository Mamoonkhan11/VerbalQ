# Fix ML Service Port Binding Error 🔌

## Error Message
```
==> No open ports detected, continuing to scan...
==> Port scan timeout reached, no open ports detected. Bind your service to at least one port.
```

**Cause:** The ML service isn't binding to the port that Render assigns.

---

## ✅ Solution Applied

### Fixed `render-ml.yaml`:

**Before (Broken):**
```yaml
startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
envVars:
  - key: PORT
    value: 8001  # ❌ Hardcoded port prevents Render from assigning
```

**After (Fixed):**
```yaml
startCommand: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}  # ✅ Uses Render's PORT
envVars:
  # ❌ Removed hardcoded PORT - let Render assign it dynamically
```

---

## Why This Happened

### Render's Port Assignment:

Render **dynamically assigns** ports to web services:
- You don't choose the port number
- Render sets `PORT` environment variable automatically
- Your service MUST bind to that specific port
- If you hardcode a port, Render can't detect it

### The Problem:

```bash
# This fails on Render:
uvicorn app.main:app --port 8001  # ❌ Binds to 8001, but Render expects different port

# This works:
uvicorn app.main:app --port ${PORT}  # ✅ Binds to whatever port Render assigns
```

---

## How Render Port Assignment Works

### Behind the Scenes:

1. **Render Starts Container:**
   ```bash
   PORT=10000  # Random port assigned by Render
   ```

2. **Your Start Command Runs:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
   # Expands to:
   uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```

3. **Service Binds to Correct Port:**
   ```python
   # FastAPI listens on port 10000
   app.listen(0.0.0.0, 10000)
   ```

4. **Render Detects Open Port:**
   ```
   ✅ Port 10000 is open and accepting connections
   ```

5. **Traffic Routed:**
   ```
   https://your-ml-service.onrender.com → localhost:10000
   ```

---

## Alternative Fix: Manual Configuration in Dashboard

If you're not using `render-ml.yaml`, configure manually:

### Step 1: Go to Render Dashboard
```
https://dashboard.render.com/
```

### Step 2: Navigate to ML Service
```
Click your ML service → Settings
```

### Step 3: Update Start Command
```
Start Command: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

### Step 4: Remove PORT Environment Variable
```
Environment tab:
- Find PORT variable
- Delete it (or leave it, but don't set a value)
- Render will auto-assign
```

### Step 5: Save and Redeploy
```
Click "Save Changes"
Service will auto-redeploy
```

---

## Verify It Works

### Expected Deployment Logs:

```
==> Running 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT}'
==> Detected port 8765 from start command
==> Using port 8765 for traffic
==> Port 8765 is open and accepting connections
✅ Service deployed successfully
```

### Test Health Endpoint:

```bash
curl https://your-ml-service.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "version": "1.0.0",
  "services": {
    "grammar": "LanguageTool",
    "translation": "MarianMT",
    "humanization": "BART",
    "plagiarism": "TF-IDF + Cosine Similarity"
  }
}
```

---

## Common Mistakes

### ❌ Mistake 1: Hardcoding Port
```yaml
# WRONG - Don't do this:
startCommand: uvicorn app.main:app --port 8001
envVars:
  - key: PORT
    value: 8001
```

**Why it fails:** Render assigns a different port, but your service ignores it.

### ❌ Mistake 2: Not Binding to 0.0.0.0
```yaml
# WRONG - Only binds to localhost:
startCommand: uvicorn app.main:app --port ${PORT}
```

**Why it fails:** Needs `--host 0.0.0.0` to accept external connections.

### ❌ Mistake 3: Quoting the PORT Variable
```yaml
# SOMETIMES WRONG - Depends on YAML parser:
startCommand: uvicorn app.main:app --port "${PORT}"
```

**Why it might fail:** Some parsers don't expand variables in quotes.

### ✅ Correct Approach:
```yaml
# RIGHT - Unquoted with curly braces:
startCommand: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

---

## Local Development vs Production

### Local Development (Your Computer):

You CAN hardcode the port locally:
```python
# ml-service/app/main.py
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,  # ✅ Fine for local testing
        reload=True
    )
```

Run with:
```bash
python run.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Production (Render):

Render controls the port:
```bash
# Render runs:
uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
# Where ${PORT} is dynamically assigned
```

---

## Troubleshooting

### Issue: Still Getting Port Error After Fix

**Possible causes:**

1. **Old deployment still active:**
   ```bash
   # Force new deployment:
   git commit --allow-empty -m "Force redeploy with port fix"
   git push origin main
   ```

2. **Cached build:**
   ```
   Render Dashboard → Service → Settings → Clear Cache
   Then: Manual Deploy → Deploy Latest Commit
   ```

3. **YAML syntax error:**
   ```bash
   # Validate YAML syntax:
   python -c "import yaml; yaml.safe_load(open('render-ml.yaml'))"
   ```

### Issue: Service Starts But Can't Access

**Check logs:**
```
Render Dashboard → Logs tab
```

Look for:
```
INFO:     Uvicorn running on http://0.0.0.0:8765
```

If you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001  # ❌ Wrong!
```

Then `--host 0.0.0.0` is missing from start command.

---

## Best Practices

### ✅ Do:
- Use `${PORT}` in start commands
- Always bind to `0.0.0.0` (not `127.0.0.1`)
- Let Render assign ports dynamically
- Test health endpoint after deploy

### ❌ Don't:
- Hardcode port numbers in production
- Set PORT environment variable manually
- Bind to localhost only
- Assume port numbers stay the same across deploys

---

## Other Platforms

### Railway.app:
```yaml
# Same approach:
startCommand: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

### Heroku:
```yaml
# Also uses PORT env var:
web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

### Fly.io:
```yaml
# Uses PORT internally:
services:
  - internal_port: 8001
    ports:
      - handlers: http
        port: 8001
```

---

## Complete Example: render-ml.yaml

```yaml
services:
  - type: web                    # Web service (receives HTTP traffic)
    name: verbalq-ml-service     # Service name
    env: python                  # Python runtime
    region: oregon               # Deploy region (match backend)
    plan: starter                # Pricing tier
    
    buildCommand: pip install -r requirements.txt  # Install dependencies
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port ${PORT}  # ✅ Dynamic port
    
    envVars:                     # Environment variables
      - key: PYTHON_VERSION
        value: 3.10.0
      - key: OLLAMA_URL          # Your Ollama instance
        sync: false              # Set manually in dashboard
      - key: OLLAMA_MODEL
        value: mistral
    
    healthCheckPath: /health     # Health check endpoint
    autoDeploy: true             # Auto-deploy on git push
```

---

## Quick Reference

### Port Binding Patterns:

**Python (FastAPI/Uvicorn):**
```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

**Node.js (Express):**
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');
```

**Python (Flask):**
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

**Go:**
```go
port := os.Getenv("PORT")
if port == "" {
    port = "8080"
}
http.ListenAndServe(":" + port, nil)
```

---

## Summary

### What Was Fixed:
1. ✅ Changed `$PORT` to `${PORT}` (proper shell expansion)
2. ✅ Removed hardcoded PORT environment variable
3. ✅ Kept `--host 0.0.0.0` for external access

### Next Steps:
```bash
# Commit the fix
git add render-ml.yaml
git commit -m "Fix: Use dynamic port assignment for Render"
git push origin main

# Watch deployment
# Render Dashboard → ML Service → Logs
```

### Expected Result:
```
✅ Detected port XXXX from start command
✅ Service deployed successfully
```

---

**TL;DR:** Render assigns ports dynamically. Changed `--port $PORT` to `--port ${PORT}` and removed hardcoded PORT env var. Service will now bind to correct port! 🎉

Good luck! Your ML service should deploy successfully now! 🔌✨
