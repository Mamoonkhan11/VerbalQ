# Ollama GPU Cloud Setup Guide 🚀

This guide shows you how to set up Ollama on a GPU cloud provider so your ML service can use it.

---

## Why You Need This

The ML service (`ml-service`) requires **Ollama** to run LLM models (mistral) for:
- ✅ Text humanization
- ✅ AI detection
- ✅ Advanced grammar correction

**Problem:** Render's free/starter plans don't include GPU  
**Solution:** Deploy Ollama separately on a GPU cloud provider

---

## Option 1: RunPod.io (Recommended ⭐)

**Cost:** ~$0.40-0.70/hour (~$300-500/month if always on)  
**Best for:** Production, reliable performance

### Step-by-Step Setup (20 minutes)

#### 1. Create RunPod Account (2 min)
1. Go to https://runpod.io/
2. Click "Sign Up" → Use GitHub/Google account
3. Add $5-10 credit to start (PayPal/Crypto/Card)

#### 2. Deploy Ollama Pod (10 min)

**a) Choose GPU:**
- Click "Deploy" → "GPU Cloud"
- Recommended GPUs:
  - **RTX 3090** ($0.40/hr) - Good for testing
  - **RTX 4090** ($0.70/hr) - Best performance
  - **A10G** ($1.00/hr) - Enterprise grade

**b) Select Template:**
- Search for "Ollama" in templates
- OR use "RunPod Container" and install manually

**c) Configure:**
```yaml
GPU: RTX 3090 (24GB VRAM)
System Memory: 50 GB
Disk: 50 GB (minimum for models)
Container Disk: 20 GB
```

**d) Environment Variables:**
```env
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

**e) Open Ports:**
- `11434` (Ollama API)
- Enable HTTP/HTTPS

**f) Deploy:**
- Click "Deploy"
- Wait 3-5 minutes for pod to start
- Status changes to "Running"

#### 3. Get Your Ollama URL (2 min)

Once pod is running:
1. Click on your pod name
2. Copy the **Public IP** or **Endpoint URL**
3. Format: `https://your-pod-id-11434.proxy.runpod.net`
   OR
   `http://YOUR_PUBLIC_IP:11434`

**Example:**
```
https://abc123-def456-11434.proxy.runpod.net
```

#### 4. Install Ollama Model (5 min)

Connect to your pod:
1. Click "Connect" button on pod dashboard
2. Opens terminal session

Install Ollama and model:
```bash
# Update system
apt update && apt upgrade -y

# Install Ollama (if not in template)
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &

# Pull mistral model (required by your app)
ollama pull mistral

# Verify it works
ollama run mistral "Hello, are you working?"
```

Expected output:
```
Yes, I'm working! How can I help you today?
```

#### 5. Configure ML Service (2 min)

Update your ML service environment variables:

**File:** `ml-service/.env`
```env
OLLAMA_URL=https://abc123-def456-11434.proxy.runpod.net
OLLAMA_MODEL=mistral
PORT=8001
```

**Deploy ML service to Render** with these variables.

#### 6. Test Connection (1 min)

From your local machine:
```bash
curl https://your-ollama-url/v1/models
```

Should return list of models including "mistral".

---

## Option 2: Lambda Labs (Alternative)

**Cost:** ~$0.50/hour (RTX 3090)  
**Best for:** Budget-conscious, good performance

### Quick Setup

1. **Sign up:** https://lambdalabs.com/
2. **Launch Instance:**
   - GPU Type: GeForce RTX 3090
   - Region: Choose closest to Render (US West)
3. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull mistral
   ollama serve
   ```
4. **Get Public IP** from dashboard
5. **Configure ML service:**
   ```env
   OLLAMA_URL=http://YOUR_LAMBDA_IP:11434
   ```

---

## Option 3: Vast.ai (Cheapest)

**Cost:** ~$0.25-0.40/hour  
**Best for:** Testing, budget deployments

### Setup Steps

1. **Create account:** https://vast.ai/
2. **Search for GPU:**
   - Filter: RTX 3090 or better
   - Sort by price
   - Look for high reliability hosts
3. **Rent instance:**
   - Choose Ubuntu 20.04+ template
   - 50GB+ storage
   - Click "Rent"
4. **Install Ollama** (same as above)
5. **Get endpoint URL** from dashboard

⚠️ **Warning:** Less reliable than RunPod/Lambda, but cheapest.

---

## Option 4: Hugging Face Spaces (Easy but Limited)

**Cost:** Free tier available, paid from $9/month  
**Best for:** Testing only, not production

### Limitations
- ❌ CPU-only on free tier (very slow)
- ❌ Limited GPU on paid tiers
- ✅ Easy to set up
- ✅ No server management

If you choose this route, modify your ML service to use Hugging Face Inference API instead of Ollama.

---

## Cost Optimization Strategies

### 1. Auto-Sleep Script (Save Money!)

Create a script to stop pod when not in use:

**File:** `scripts/sleep-ollama.py`
```python
#!/usr/bin/env python3
"""
Auto-sleep script to save GPU costs.
Stops pod after 30 minutes of inactivity.
"""

import requests
import time
from datetime import datetime, timedelta

RUNPOD_API_KEY = "your_api_key"
POD_ID = "your_pod_id"
INACTIVITY_LIMIT = 30  # minutes

last_activity = datetime.now()

def check_activity():
    """Check if there was recent API activity."""
    try:
        response = requests.get(f"{OLLAMA_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def sleep_pod():
    """Stop the pod to save costs."""
    headers = {"Authorization": f"Bearer {RUNPOD_API_KEY}"}
    requests.post(f"https://api.runpod.io/graphql/pod/{POD_ID}/stop", headers=headers)
    print(f"Pod stopped at {datetime.now()}")

# Main loop
while True:
    if check_activity():
        last_activity = datetime.now()
        print(f"Activity detected at {last_activity}")
    
    if datetime.now() - last_activity > timedelta(minutes=INACTIVITY_LIMIT):
        print("No activity for 30 minutes. Sleeping pod...")
        sleep_pod()
        break
    
    time.sleep(60)  # Check every minute
```

**Usage:**
```bash
# Run as background process
nohup python3 sleep-ollama.py &
```

### 2. Manual Start/Stop

Only run pod when you need it:

**Morning (start):**
```bash
# Via RunPod API or dashboard
curl -X POST "https://api.runpod.io/graphql/pod/YOUR_POD_ID/start" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Night (stop):**
```bash
curl -X POST "https://api.runpod.io/graphql/pod/YOUR_POD_ID/stop" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Cost with auto-sleep:** ~$50-100/month (vs $300-500 always on)

---

## Configuration for Production

### 1. Security Hardening

**Add authentication to Ollama:**

Create `docker-compose.yml` for your pod:
```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_API_TOKEN=your-secret-token-here
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

**Update ML service to include token:**
```python
# In ollama_client.py
headers = {
    "Authorization": f"Bearer {os.getenv('OLLAMA_API_TOKEN')}",
}
```

### 2. Load Balancing (Multiple Pods)

For high availability:

```python
# In ml-service/app/config.py
OLLAMA_URLS = [
    "https://pod1.proxy.runpod.net",
    "https://pod2.proxy.runpod.net",
]

# Rotate between URLs
import random
OLLAMA_URL = random.choice(OLLAMA_URLS)
```

### 3. Health Monitoring

Create health check endpoint:

**File:** `ml-service/app/routers/ollama_health.py`
```python
from fastapi import APIRouter, HTTPException
import requests

router = APIRouter(prefix="/ollama-health", tags=["health"])

@router.get("")
async def check_ollama_health():
    """Check if Ollama is reachable and healthy."""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            return {"status": "healthy", "ollama": "connected"}
        else:
            raise HTTPException(status_code=503, detail="Ollama unhealthy")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama unreachable: {str(e)}")
```

---

## Alternative: Cloud LLM APIs (No GPU Needed)

If GPU hosting is too complex/expensive, consider:

### Option A: OpenAI API

Replace Ollama calls with OpenAI:

**Modify** `ollama_client.py`:
```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")

def humanize_text(self, text: str, language: str, tone: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user",
            "content": f"Rewrite this text in a {tone} tone: {text}"
        }]
    )
    return response.choices[0].message.content
```

**Cost:** ~$0.002 per request (much cheaper for low usage!)

### Option B: Hugging Face Inference API

```python
from huggingface_hub import InferenceClient

client = InferenceClient(token="hf_...")

def humanize_text(self, text: str, language: str, tone: str) -> str:
    response = client.text_generation(
        prompt=f"Rewrite: {text}",
        model="mistralai/Mistral-7B-Instruct-v0.1"
    )
    return response
```

**Cost:** Free tier available, then ~$0.01 per request

---

## Troubleshooting

### Issue: Can't Connect to Ollama

```bash
# Test from your computer
curl https://your-ollama-url:11434/api/tags

# Should return list of models
```

**Solutions:**
- Check pod is running (not stopped)
- Verify port 11434 is open
- Check firewall settings
- Ensure Ollama service is running inside pod

### Issue: Model Not Found

```bash
# SSH into pod
ollama list

# If mistral not listed:
ollama pull mistral
```

### Issue: Slow Response Times

**Causes:**
- Network latency (pod far from Render)
- GPU overloaded
- Model too large

**Solutions:**
1. Use same region as Render (Oregon for US)
2. Upgrade to better GPU (RTX 4090)
3. Use smaller model (tinyllama for testing)

### Issue: CUDA Out of Memory

```bash
# Check GPU memory usage
nvidia-smi

# Stop other processes using GPU
pkill -9 python
```

**Solutions:**
- Use smaller model
- Upgrade GPU (more VRAM)
- Restart pod

---

## Complete Deployment Checklist

### GPU Cloud Setup
- [ ] Created account on RunPod/Lambda/Vast
- [ ] Added credits ($5-10 minimum)
- [ ] Deployed GPU instance (RTX 3090 or better)
- [ ] Opened port 11434
- [ ] Got public URL/IP

### Ollama Installation
- [ ] Installed Ollama in pod
- [ ] Pulled mistral model
- [ ] Tested with `ollama run`
- [ ] Verified API endpoint works

### ML Service Configuration
- [ ] Updated OLLAMA_URL in environment
- [ ] Set OLLAMA_MODEL=mistral
- [ ] Deployed ML service to Render
- [ ] Tested health endpoint

### Integration Testing
- [ ] Backend can reach ML service
- [ ] ML service can reach Ollama
- [ ] Humanize feature works
- [ ] AI detection works
- [ ] Response times acceptable (<10s)

### Cost Management
- [ ] Set up auto-sleep script (optional)
- [ ] Configured monitoring alerts
- [ ] Estimated monthly costs
- [ ] Budget tracking enabled

---

## Quick Reference

### Common Commands

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull model
ollama pull mistral

# List models
ollama list

# Test model
ollama run mistral "Hello"

# Check GPU usage
nvidia-smi

# View Ollama logs
journalctl -u ollama -f
```

### Important URLs

```
Ollama API:     http://your-ip:11434
Health Check:   http://your-ip:11434/api/tags
Models List:    http://your-ip:11434/v1/models
ML Service:     https://your-ml.onrender.com
Backend:        https://your-backend.onrender.com
```

### Environment Variables

```env
# ML Service
OLLAMA_URL=http://your-ollama-ip:11434
OLLAMA_MODEL=mistral
PORT=8001

# Optional
OLLAMA_API_TOKEN=your-auth-token
OLLAMA_TIMEOUT=60
```

---

## Next Steps

After Ollama is set up:

1. ✅ **Test locally first:**
   ```bash
   cd ml-service
   python run.py
   # Test humanize endpoint
   ```

2. ✅ **Deploy ML service:**
   ```bash
   # On Render dashboard
   # Add environment variables
   # Deploy
   ```

3. ✅ **Update backend:**
   ```bash
   # Update ML_SERVICE_URL
   # Redeploy backend
   ```

4. ✅ **Test full flow:**
   - Frontend → Backend → ML Service → Ollama
   - All features should work now!

---

## Support Resources

- **RunPod Docs:** https://docs.runpod.io/
- **Ollama Docs:** https://github.com/ollama/ollama
- **Community Discord:** https://discord.gg/ollama
- **Your TROUBLESHOOTING.md:** For app-specific issues

---

## Estimated Costs Summary

### Testing (Part-time)
```
GPU (RTX 3090): $0.40/hr × 4 hrs/day × 30 days = ~$48/month
Storage:        Included
Bandwidth:      Included
─────────────────────────────
Total:          ~$50/month
```

### Production (Always On)
```
GPU (RTX 4090): $0.70/hr × 24 hrs × 30 days = ~$504/month
Or manage with auto-sleep: ~$150-200/month
─────────────────────────────
Total:          ~$150-500/month
```

### Cheaper Alternative (Cloud APIs)
```
OpenAI/HF API:  Pay per use
Average:        $0.01/request × 1000 requests/day = ~$300/month
No GPU management needed!
─────────────────────────────
Total:          ~$20-50/month (for moderate usage)
```

---

**Recommendation:** Start with RunPod RTX 3090 for testing (~$50/month with manual sleep), then migrate to cloud APIs or dedicated GPU based on usage patterns.

Good luck! 🚀
