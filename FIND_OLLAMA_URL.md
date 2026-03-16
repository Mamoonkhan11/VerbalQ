# How to Find Your Ollama Instance URL 🔗

Quick reference for finding your Ollama endpoint URL on different platforms.

---

## RunPod.io ⭐ (Most Common)

### Method 1: From Dashboard (Easiest)

1. **Go to Dashboard:**
   - https://runpod.io/console
   - Click "Pods" in left sidebar

2. **Find Your Pod:**
   - Look for your running Ollama pod
   - Click on the pod name to expand details

3. **Copy the URL:**
   - Look for **"Connect"** section
   - You'll see something like:
     ```
     https://abc123def456-11434.proxy.runpod.net
     ```
   - Click the copy icon next to it

4. **Format for Use:**
   ```env
   OLLAMA_URL=https://abc123def456-11434.proxy.runpod.net
   ```
   
   ⚠️ **Important:** 
   - Include `https://`
   - NO port number at end (it's already in the URL)
   - NO trailing slash

### Method 2: From Pod Terminal

If you're already connected to the pod:

```bash
# Get the public IP
curl ifconfig.me
```

Then format as:
```
http://YOUR_IP:11434
```

### Method 3: Via API

```bash
curl -X GET "https://api.runpod.io/graphql/pod/YOUR_POD_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response will include `endpoint` field with the URL.

---

## Lambda Labs

### From Dashboard

1. **Login:** https://cloud.lambdalabs.com/
2. **Go to:** Instances → Your instance
3. **Find:** "Instance DNS" or "Public IP"
4. **Copy:** The IP address (e.g., `123.45.67.89`)

**Format:**
```env
OLLAMA_URL=http://123.45.67.89:11434
```

Note: Lambda uses `http://` not `https://` by default

---

## Vast.ai

### From Console

1. **Dashboard:** https://console.vast.ai/
2. **Click:** "Instances" tab
3. **Find:** Your rented instance
4. **Look for:** "IP Address:Port" column
5. **Copy:** Something like `185.230.17.119:41234`

**Format:**
```env
OLLAMA_URL=http://185.230.17.119:41234
```

Each instance has a random port assigned.

---

## Self-Hosted (Home Server/VPS)

### Local Network

If running on your local network:

```bash
# On the server itself
curl ifconfig.me
# or
hostname -I
```

**Format:**
```env
# If same machine as ML service
OLLAMA_URL=http://localhost:11434

# If different machine on same network
OLLAMA_URL=http://192.168.1.100:11434
```

### Public Server (VPS)

For DigitalOcean, AWS, GCP, Azure:

1. **Find Public IP** from provider's dashboard
2. **Ensure port 11434 is open** in firewall
3. **Format:**
   ```env
   OLLAMA_URL=http://YOUR_VPS_IP:11434
   ```

---

## Testing the URL

Once you have the URL, test it:

### Test 1: Health Check
```bash
curl https://your-ollama-url/health
```

Expected: Should return quickly (may be empty response)

### Test 2: List Models
```bash
curl https://your-ollama-url/api/tags
```

Expected: JSON list of installed models
```json
{"models":[{"name":"mistral:latest",...}]}
```

### Test 3: Simple Query
```bash
curl https://your-ollama-url/api/generate -d '{
  "model": "mistral",
  "prompt": "Say hello",
  "stream": false
}'
```

Expected: Response from model

---

## Common URL Formats by Provider

| Provider | Format | Example | Port |
|----------|--------|---------|------|
| **RunPod** | `https://POD_ID-PORT.proxy.runpod.net` | `https://abc123-11434.proxy.runpod.net` | Included |
| **Lambda** | `http://IP_ADDRESS:11434` | `http://52.14.123.45:11434` | 11434 |
| **Vast.ai** | `http://IP_ADDRESS:RANDOM_PORT` | `http://185.230.17.119:41234` | Varies |
| **DigitalOcean** | `http://IP_ADDRESS:11434` | `http://104.248.123.45:11434` | 11434 |
| **AWS EC2** | `http://PUBLIC_IP:11434` | `http://54.123.45.67:11434` | 11434 |
| **Localhost** | `http://localhost:11434` | `http://localhost:11434` | 11434 |

---

## Troubleshooting

### Can't Connect to URL

**Error:** `Connection refused` or `Timeout`

**Checklist:**
- [ ] Pod/instance is actually running (not stopped)
- [ ] Correct protocol (`http://` vs `https://`)
- [ ] Port is included (if needed)
- [ ] No trailing slash at end
- [ ] Firewall allows port 11434
- [ ] Ollama service is running inside the instance

**Test from inside the instance:**
```bash
# SSH into your instance
curl http://localhost:11434/api/tags
```

If this works but external URL doesn't → Firewall issue

### Getting 404 Errors

**Error:** `404 Not Found`

Usually means:
- Wrong URL format
- Missing `/api/tags` path
- Using wrong endpoint

Try:
```bash
curl https://your-url/api/tags
curl https://your-url/v1/models
curl https://your-url/health
```

### SSL/Certificate Errors

**Error:** `SSL certificate verify failed`

Solutions:
```python
# In Python code (temporary fix)
import requests
requests.get(url, verify=False)  # Not recommended for production

# Better: Use correct protocol
# http:// for non-SSL
# https:// for SSL-enabled
```

---

## Quick Reference by Provider

### RunPod
```
Dashboard → Pods → Click Pod Name → Connect → Copy URL
Format: https://XXXX-11434.proxy.runpod.net
```

### Lambda Labs
```
Console → Instances → Instance Details → Public IP
Format: http://XXX.XXX.XXX.XXX:11434
```

### Vast.ai
```
Console → Instances → IP:Port column
Format: http://XXX.XXX.XXX.XXX:PORT
```

### DigitalOcean
```
Droplets → Click Droplet → IPv4 Address
Format: http://XXX.XXX.XXX.XXX:11434
```

### AWS EC2
```
EC2 → Instances → Public IPv4 Address
Format: http://XXX.XXX.XXX.XXX:11434
```

---

## Environment Variable Setup

Once you have the URL, add it to your ML service:

### For Render Deployment

1. **Render Dashboard** → Your ML Service → Environment
2. **Add Variable:**
   ```
   Key: OLLAMA_URL
   Value: https://your-ollama-url-here
   ```
3. **Save Changes** → Service will redeploy

### For Local Testing

Create `.env` file in `ml-service/`:
```env
OLLAMA_URL=https://abc123-11434.proxy.runpod.net
OLLAMA_MODEL=mistral
PORT=8001
```

### Verify It Works

After setting the variable:

```bash
# Test from ML service
curl $OLLAMA_URL/api/tags

# Or visit in browser
https://your-ollama-url/api/tags
```

Should return list of available models.

---

## Security Notes

### For Production

1. **Use HTTPS** when possible (RunPod provides this)
2. **Add authentication:**
   ```env
   OLLAMA_API_TOKEN=your-secret-token
   ```
3. **Restrict access** via firewall/IP whitelist
4. **Don't expose** directly to internet without auth

### For Testing

HTTP is fine for:
- Local development
- Private networks
- Behind VPN
- Short-term testing

---

## Complete Example: RunPod Setup

Let's walk through finding URL on RunPod:

### Step 1: Login
```
https://runpod.io/console
```

### Step 2: Navigate
```
Click "Pods" in left sidebar
See your running pods
```

### Step 3: Expand Pod Details
```
Click on pod name (e.g., "ollama-server")
Expands to show details
```

### Step 4: Find Connect Section
```
Look for box labeled "Connect"
Shows:
  - Terminal button
  - HTTP Service button  
  - URL: https://abc123-11434.proxy.runpod.net
```

### Step 5: Copy URL
```
Click copy icon next to URL
Or manually select and copy
```

### Step 6: Use in Configuration
```env
OLLAMA_URL=https://abc123-11434.proxy.runpod.net
```

### Step 7: Test
```bash
curl https://abc123-11434.proxy.runpod.net/api/tags
```

Should return:
```json
{
  "models": [
    {
      "name": "mistral:latest",
      "size": 4108567982,
      ...
    }
  ]
}
```

---

## Screenshot Guide (Text Description)

Since I can't show actual screenshots, here's what to look for:

### RunPod Dashboard Layout
```
┌─────────────────────────────────────┐
│  RunPod Console                     │
├─────────────────────────────────────┤
│  Pods  │  Storage  │  Networks      │
├─────────────────────────────────────┤
│                                     │
│  📦 ollama-server (RUNNING)         │
│     ┌──────────────────────────┐   │
│     │ GPU: RTX 3090            │   │
│     │ Status: Running          │   │
│     │                          │   │
│     │ 🔗 Connect               │   │
│     │ https://abc123-11434...  │ ← COPY THIS
│     │ [Terminal] [HTTP]        │   │
│     └──────────────────────────┘   │
└─────────────────────────────────────┘
```

The URL in the "Connect" section is what you need!

---

## Quick Troubleshooting Table

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Connection refused | Wrong port | Use :11434 or proxy URL |
| Timeout | Firewall blocking | Open port 11434 |
| 404 Error | Wrong path | Use `/api/tags` not just base URL |
| SSL Error | HTTP vs HTTPS | Match protocol to provider |
| Empty response | Ollama not running | Start Ollama service |

---

## Need More Help?

If you still can't find your URL:

1. **Check provider documentation:**
   - RunPod: https://docs.runpod.io/
   - Lambda: https://docs.lambdalabs.com/
   - Vast.ai: https://docs.vast.ai/

2. **Contact support:**
   - Most providers have live chat
   - Show them your dashboard
   - They can point to the URL

3. **Ask in community:**
   - RunPod Discord
   - Ollama Discord: https://discord.gg/ollama
   - Reddit r/LocalLLaMA

---

**TL;DR:** 
- **RunPod:** Dashboard → Pods → Click Pod → Copy URL from Connect section
- **Others:** Get Public IP, append `:11434`, use `http://`
- **Test:** `curl YOUR_URL/api/tags` should list models

Good luck! 🎯
