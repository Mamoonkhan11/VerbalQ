# Ollama + ngrok Setup Guide 🔗

Use ngrok to expose your local Ollama instance to the internet - **FREE alternative to GPU cloud!**

---

## Why Use ngrok?

### Benefits
- ✅ **Free** (with limitations)
- ✅ Use your own computer's GPU
- ✅ No cloud hosting costs
- ✅ Easy setup (10 minutes)
- ✅ Full control over models
- ✅ Great for development/testing

### Limitations
- ⚠️ Your computer must stay on
- ⚠️ URL changes every restart (free tier)
- ⚠️ Limited bandwidth on free tier
- ⚠️ Slightly higher latency than cloud

### Cost Comparison
```
RunPod RTX 3090:  $0.40/hour = ~$300/month (always on)
ngrok Free:       $0/month   = FREE! 💰
ngrok Paid:       $8/month   = Static URL
```

---

## Prerequisites

1. **NVIDIA GPU** (recommended) or Mac M1/M2
   - Minimum 8GB VRAM for mistral model
   - Check: `nvidia-smi` or `About This Mac`

2. **Ollama installed locally**
   ```bash
   # Windows/Mac/Linux
   curl https://ollama.com/install.sh | sh
   ```

3. **ngrok account** (free)
   - Go to https://ngrok.com/
   - Sign up with GitHub/Email
   - Get your authtoken

---

## Step-by-Step Setup (15 minutes)

### Step 1: Install & Configure Ollama (5 min)

#### Install Ollama
```bash
# Windows: Download from https://ollama.com/download
# Mac: 
brew install ollama

# Linux:
curl -fsSL https://ollama.com/install.sh | sh
```

#### Pull Required Models
```bash
# Start Ollama service
ollama serve

# In another terminal, pull models
ollama pull mistral
ollama pull llama2  # Optional backup
```

#### Verify It Works Locally
```bash
curl http://localhost:11434/api/tags
```

Should return list of models including "mistral".

---

### Step 2: Install ngrok (3 min)

#### Option A: Using npm (if you have Node.js)
```bash
npm install -g ngrok
```

#### Option B: Direct Download
1. Go to https://ngrok.com/download
2. Download for your OS
3. Extract to a folder (e.g., `C:\ngrok` or `~/ngrok`)
4. Add to PATH

#### Option C: Package Manager
```bash
# Mac
brew install ngrok

# Windows (Chocolatey)
choco install ngrok

# Linux
snap install ngrok
```

---

### Step 3: Configure ngrok (2 min)

1. **Get Your Authtoken:**
   - Login to https://dashboard.ngrok.com/
   - Click "Your Authtoken" in left sidebar
   - Copy the token (looks like: `2Rj...`)

2. **Save Token:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

   Example:
   ```bash
   ngrok config add-authtoken 2RjKxYz9AbCdEfGhIjKlMnOpQrStUvWx
   ```

3. **Verify Configuration:**
   ```bash
   ngrok --version
   ```
   Should show: `Account Plan: Free` and your email

---

### Step 4: Expose Ollama to Internet (3 min)

#### Start ngrok Tunnel
```bash
ngrok http 11434 --host-header="localhost:11434"
```

You'll see output like:
```
Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123-def456.ngrok.io -> http://localhost:11434
Forwarding                    http://abc123-def456.ngrok.io -> http://localhost:11434

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**IMPORTANT:** Copy the HTTPS URL:
```
https://abc123-def456.ngrok.io
```

⚠️ **Note:** This URL changes every time you restart ngrok (free tier limitation)

---

### Step 5: Test Ollama via ngrok (2 min)

#### Test Health Endpoint
```bash
curl https://your-ngrok-url.ngrok.io/api/tags
```

Should return same as localhost test.

#### Test Model Query
```bash
curl https://your-ngrok-url.ngrok.io/api/generate -d '{
  "model": "mistral",
  "prompt": "Say hello in one word",
  "stream": false
}'
```

Expected response:
```json
{
  "response": "Hello!",
  "done": true
}
```

---

## Integration with Your ML Service

### Update Environment Variables

**File:** `ml-service/.env`
```env
OLLAMA_URL=https://abc123-def456.ngrok.io
OLLAMA_MODEL=mistral
PORT=8001
```

### Deploy ML Service to Render

1. Render Dashboard → ML Service → Environment
2. Add variables:
   ```
   OLLAMA_URL: https://abc123-def456.ngrok.io
   OLLAMA_MODEL: mistral
   ```
3. Save and Redeploy

### Test Integration
```bash
curl https://your-ml-service.onrender.com/health
```

Then test a feature:
```bash
curl https://your-ml-service.onrender.com/humanize -X POST -H "Content-Type: application/json" -d '{
  "text": "The weather is nice today.",
  "tone": "casual",
  "language": "en"
}'
```

---

## Keeping ngrok Running

### Problem: Free Tier URL Changes

On free tier, ngrok gives you a **random URL** each time you start it.

### Solutions:

#### Option 1: Pay for Static URL ($8/month)
```bash
# With paid plan, you get a reserved domain
ngrok http 11434 --domain=your-name.ngrok.io
```

Benefits:
- ✅ Same URL every time
- ✅ More reliable
- ✅ Still cheaper than GPU cloud!

#### Option 2: Auto-Update Script (Free)

Create a script that updates your ML service when ngrok restarts:

**File:** `scripts/update-ollama-url.py`
```python
#!/usr/bin/env python3
"""
Auto-update OLLAMA_URL when ngrok URL changes.
"""

import requests
import os
import time
import json

NGROK_API_URL = "http://localhost:4040/api/tunnels"
RENDER_API_KEY = os.getenv("RENDER_API_KEY")
SERVICE_ID = os.getenv("RENDER_SERVICE_ID")

def get_ngrok_url():
    """Get current ngrok URL from local API."""
    try:
        response = requests.get(NGROK_API_URL)
        tunnels = response.json().get("tunnels", [])
        
        for tunnel in tunnels:
            if tunnel.get("proto") == "https":
                return tunnel.get("public_url")
        
        return None
    except Exception as e:
        print(f"Error getting ngrok URL: {e}")
        return None

def update_render_env(url):
    """Update environment variable on Render."""
    if not RENDER_API_KEY or not SERVICE_ID:
        print("RENDER_API_KEY or SERVICE_ID not set")
        return False
    
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "envVars": [
            {
                "key": "OLLAMA_URL",
                "value": url
            }
        ]
    }
    
    response = requests.put(
        f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars",
        headers=headers,
        json=data
    )
    
    return response.status_code == 200

if __name__ == "__main__":
    print("Monitoring ngrok URL...")
    
    last_url = None
    
    while True:
        current_url = get_ngrok_url()
        
        if current_url and current_url != last_url:
            print(f"New ngrok URL detected: {current_url}")
            
            if update_render_env(current_url):
                print("✅ Render environment updated!")
                last_url = current_url
            else:
                print("❌ Failed to update Render")
        
        time.sleep(60)  # Check every minute
```

**Usage:**
```bash
# Run in background while ngrok is running
python scripts/update-ollama-url.py &
```

#### Option 3: Manual Update (Simplest)

When ngrok URL changes:
1. Copy new URL from ngrok terminal
2. Render Dashboard → ML Service → Environment
3. Update `OLLAMA_URL`
4. Save (auto-redeploys)

Takes 30 seconds, acceptable for testing.

---

## Advanced Configuration

### Keep Your Computer Awake

#### Windows
```powershell
# Prevent sleep
powercfg -change -standby-timeout-ac 0
```

#### Mac
```bash
# Prevent sleep (built-in)
caffeinate -d
```

Or use app like **Amphetamine** (Mac App Store)

#### Linux
```bash
# Disable sleep
systemd-inhibit --what=sleep bash
```

### Run as Background Service

#### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "When I log on"
4. Action: "Start a program"
5. Program: `ngrok.exe`
6. Arguments: `http 11434 --host-header="localhost:11434"`
7. Finish

#### Mac (launchd)

Create `~/Library/LaunchAgents/com.ngrok.ollama.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ngrok.ollama</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/ngrok</string>
        <string>http</string>
        <string>11434</string>
        <string>--host-header=localhost:11434</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.ngrok.ollama.plist
```

#### Linux (systemd)

Create `/etc/systemd/system/ngrok-ollama.service`:
```ini
[Unit]
Description=ngrok tunnel for Ollama
After=network.target ollama.service

[Service]
Type=simple
User=your-username
ExecStart=/usr/local/bin/ngrok http 11434 --host-header=localhost:11434
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable ngrok-ollama
sudo systemctl start ngrok-ollama
```

---

## Performance Optimization

### Reduce Latency

1. **Choose Closest ngrok Region:**
   ```bash
   # List available regions
   ngrok --list-regions
   
   # Use closest to Render (Oregon = us-west)
   ngrok http 11434 --region us
   ```

2. **Optimize Ollama:**
   ```bash
   # Set GPU offload layers (faster inference)
   export OLLAMA_NUM_GPU=999
   
   # Restart Ollama
   ollama serve
   ```

3. **Use Smaller Models:**
   ```bash
   # Faster but less capable
   ollama pull tinyllama
   ollama pull phi
   
   # Update .env
   OLLAMA_MODEL=tinyllama
   ```

### Monitor Performance

```bash
# Check response times
time curl https://your-ngrok-url.ngrok.io/api/generate -d '{
  "model": "mistral",
  "prompt": "Hello",
  "stream": false
}'
```

Typical latencies:
- Local: 1-3 seconds
- ngrok (same region): 2-5 seconds
- ngrok (different region): 5-10 seconds

---

## Security Considerations

### Add Authentication

Since anyone with the URL can use your Ollama:

#### Option 1: ngrok IP Whitelist (Paid Feature)
```bash
# Only allow specific IPs
ngrok http 11434 --allow-cidr=1.2.3.4/32
```

#### Option 2: Custom Middleware

Add auth to your ML service:

**File:** `ml-service/app/main.py`
```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

@app.middleware("http")
async def verify_auth(request: Request, call_next):
    # Skip auth for health checks
    if request.url.path == "/health":
        return await call_next(request)
    
    try:
        creds = await security(request)
        # Verify token
        if creds.credentials != os.getenv("API_SECRET"):
            raise HTTPException(status_code=401)
    except:
        raise HTTPException(status_code=401)
    
    return await call_next(request)
```

Then in `.env`:
```env
API_SECRET=your-secret-token-here
```

#### Option 3: ngrok Webhook Verification

Use ngrok's request signing:
```python
from ngrok import verify_signature

@app.middleware("http")
async def verify_ngrok_signature(request: Request, call_next):
    # Verify ngrok signature
    if not verify_signature(request):
        raise HTTPException(status_code=403)
    
    return await call_next(request)
```

---

## Troubleshooting

### Issue: ngrok Won't Start

**Error:** `address already in use`

**Solution:**
```bash
# Kill whatever is using port 4040
# Windows
netstat -ano | findstr :4040
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4040 | xargs kill -9
```

### Issue: Connection Timeout

**Symptoms:**
- ML service can't reach Ollama
- Curl hangs

**Solutions:**
1. Check ngrok is still running
2. Verify URL hasn't changed
3. Test locally first: `curl http://localhost:11434`
4. Check firewall isn't blocking

### Issue: Slow Response Times

**Causes:**
- Your internet upload speed is slow
- ngrok server is far away
- GPU is overloaded

**Solutions:**
1. Test upload speed: https://speedtest.net
2. Use closer ngrok region
3. Stop other GPU-intensive tasks
4. Upgrade to ngrok paid tier (better routing)

### Issue: URL Keeps Changing

This is normal for free tier!

**Solutions:**
- Use the auto-update script above
- Or pay $8/month for static URL
- Or manually update (takes 30 seconds)

---

## Cost Breakdown

### Completely Free Setup
```
ngrok Free:     $0/month  ⚠️ URL changes each restart
Your Computer:  Already have GPU
Electricity:    ~$5-10/month (if running 24/7)
─────────────────────────────
Total:          ~$5-10/month
```

### Recommended Setup
```
ngrok Paid:     $8/month  ✅ Static URL
Your Computer:  Already have GPU
Electricity:    ~$5-10/month
─────────────────────────────
Total:          ~$13-18/month
```

### vs Cloud GPU
```
RunPod RTX 3090:  $300/month
ngrok + Home PC:  $13/month
─────────────────────────────
Savings:          $287/month! 💰
```

---

## Complete Workflow

### Daily Usage

**Morning (start everything):**
```bash
# 1. Start Ollama (if not already running)
ollama serve

# 2. Start ngrok
ngrok http 11434 --host-header="localhost:11434"

# 3. Copy the HTTPS URL
# 4. Update Render if URL changed
# 5. Test: curl YOUR_NGROK_URL/api/tags
```

**Night (optional - stop to save power):**
```bash
# Stop ngrok (Ctrl+C)
# Stop Ollama (optional)
```

### Automated Setup (Best)

Set up both as services that start on boot:

1. Ollama runs as system service
2. ngrok runs as user service
3. Computer never sleeps
4. Always available!

---

## Alternative: Local Tunnel (No ngrok)

If ngrok doesn't work for you, try alternatives:

### Cloudflare Tunnel (Free, Static URL!)

```bash
# Install cloudflared
# Mac
brew install cloudflared

# Windows
winget install Cloudflare.cloudflared

# Then run:
cloudflared tunnel --url http://localhost:11434
```

Benefits:
- ✅ Free static URL
- ✅ Faster than ngrok
- ✅ More reliable

Drawback: Slightly more complex setup

### LocalXpose
```bash
loclx tunnel http --to localhost:11434
```

### Serveo (SSH-based, no install)
```bash
ssh -R 80:localhost:11434 serveo.net
```

---

## Quick Reference

### Common Commands

```bash
# Start Ollama
ollama serve

# Start ngrok
ngrok http 11434 --host-header="localhost:11434"

# Test locally
curl http://localhost:11434/api/tags

# Test via ngrok
curl https://YOUR_URL.ngrok.io/api/tags

# Check ngrok status
curl http://localhost:4040/api/tunnels
```

### Important URLs

```
Ollama Local:     http://localhost:11434
ngrok Dashboard:  http://localhost:4040
ngrok Public URL: https://XXXX.ngrok.io
ML Service:       https://your-ml.onrender.com
Backend:          https://your-backend.onrender.com
```

### Environment Variables

```env
OLLAMA_URL=https://XXXX.ngrok.io
OLLAMA_MODEL=mistral
API_SECRET=optional-auth-token
```

---

## Success Checklist

- [ ] Ollama installed and running locally
- [ ] Mistral model pulled (`ollama pull mistral`)
- [ ] ngrok installed and configured with authtoken
- [ ] ngrok tunnel running and showing HTTPS URL
- [ ] Can access Ollama via ngrok URL from browser
- [ ] ML service configured with ngrok URL
- [ ] Tested full flow: Frontend → Backend → ML → Ollama
- [ ] Computer set to never sleep
- [ ] (Optional) ngrok running as service

---

## Next Steps

After setup is complete:

1. ✅ Test all AI features work
2. ✅ Monitor performance for a few days
3. ✅ Consider upgrading to ngrok paid ($8/month)
4. ✅ Set up auto-start services
5. ✅ Enjoy FREE GPU hosting! 🎉

---

**Estimated Setup Time:** 15-20 minutes  
**Monthly Cost:** $0-18 (vs $300+ for cloud GPU)  
**Difficulty:** Beginner-friendly  

Good luck! This is the most budget-friendly way to run your VerbalQ app! 🚀
