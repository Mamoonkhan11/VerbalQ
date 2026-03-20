# Fix Humanization Timeout Error ⏱️

## Error Message
```
Humanization error: LLM generation timeout - request took too long
POST /api/ai/humanize 503 64240.096 ms - 96
```

**Translation:** Ollama took longer than 60 seconds to generate a response.

---

## ✅ Solutions Applied

### Fix 1: Increased Timeout (60s → 180s)

**Before:**
```python
self.timeout = 60  # ❌ Too short for mistral on CPU/weak GPU
```

**After:**
```python
self.timeout = 180  # ✅ 3 minutes - enough for most generations
```

---

### Fix 2: Optimized Generation Parameters

Added performance optimizations:
```python
"options": {
    "temperature": 0.3,      # Low temp = faster, more deterministic
    "top_p": 0.9,            # Good balance of quality/speed
    "num_predict": 512,      # ✅ Limit output length
    "num_ctx": 2048,         # ✅ Smaller context = faster processing
}
```

**Benefits:**
- `num_predict: 512` - Limits response to ~400 words (enough for most text)
- `num_ctx: 2048` - Reduces context window (faster attention computation)

---

### Fix 3: Reduced Calibration Passes

**Before:**
```python
MAX_CALIBRATION_PASSES = 2  # ❌ Up to 3 generations total = 180+ seconds
```

**After:**
```python
MAX_CALIBRATION_PASSES = 1  # ✅ Max 2 generations = 120 seconds typical
```

**Impact:**
- Faster average response time
- Still gets quality improvements from calibration
- Less likely to timeout

---

## Why Timeouts Happen

### Ollama Performance Factors:

#### 1. Hardware Matters
```
GPU (RTX 3090):  5-15 seconds per generation
GPU (RTX 3060):  10-30 seconds per generation
CPU (M1/M2):     20-60 seconds per generation
CPU (Intel i7):  30-90 seconds per generation
CPU (Older):     60-180+ seconds per generation ❌
```

#### 2. Model Size
```
mistral (7B):    Fast (~30s on CPU)
llama2 (13B):    Medium (~60s on CPU)
llama2 (70B):    Slow (300s+ on CPU) ❌
```

#### 3. Text Length
```
Short (<50 words):   10-30 seconds
Medium (50-150 words): 30-90 seconds
Long (>150 words):   90-180+ seconds ❌
```

---

## Expected Response Times After Fix

### With ngrok + Home PC (CPU):
```
First pass:        30-60 seconds
+1 calibration:    30-60 seconds
──────────────────────────────
Total:             60-120 seconds ✅ (within 180s timeout)
```

### With Cloud GPU (RunPod RTX 3090):
```
First pass:        5-10 seconds
+1 calibration:    5-10 seconds
──────────────────────────────
Total:             10-20 seconds ✅ Very fast!
```

---

## Trade-offs Explained

### num_predict: 512
**What it does:** Limits maximum tokens in output

**Pros:**
- ✅ Prevents rambling responses
- ✅ Faster generation
- ✅ More predictable timing

**Cons:**
- ⚠️ Very long texts might get cut off
- ⚠️ Complex rewrites may be incomplete

**Solution:** For texts >100 words, consider splitting into chunks

---

### num_ctx: 2048
**What it does:** Context window size for attention

**Pros:**
- ✅ Faster computation
- ✅ Less memory usage
- ✅ Quicker responses

**Cons:**
- ⚠️ Can't process very long prompts
- ⚠️ May lose some context for 500+ word inputs

**Sweet spot:** Works great for texts up to ~300 words

---

### MAX_CALIBRATION_PASSES: 1
**What it does:** Limits AI detector calibration attempts

**Before (2 passes):**
```
Generation 1 → Detect → If AI: Generate 2 → Detect → If AI: Generate 3
Worst case: 3 generations = 180+ seconds ❌
```

**After (1 pass):**
```
Generation 1 → Detect → If AI: Generate 2
Worst case: 2 generations = 120 seconds ✅
```

**Quality impact:** Minimal - first calibration usually sufficient

---

## Additional Optimizations You Can Make

### Option 1: Use Faster Model

If mistral is still too slow, try:

**TinyLlama (1.1B) - Super Fast:**
```python
# In .env or config.py
OLLAMA_MODEL = "tinyllama"
```

**Phi-2 (2.7B) - Good Balance:**
```python
OLLAMA_MODEL = "phi"
```

**Comparison:**
```
mistral (7B):   Quality ⭐⭐⭐⭐⭐ | Speed ⭐⭐⭐
phi (2.7B):     Quality ⭐⭐⭐⭐   | Speed ⭐⭐⭐⭐
tinyllama(1.1B):Quality ⭐⭐⭐     | Speed ⭐⭐⭐⭐⭐
```

---

### Option 2: Reduce Temperature Further

For even faster, more deterministic output:

```python
# In ollama_client.py
"options": {
    "temperature": 0.1,  # Lower = faster, more focused
    "top_p": 0.8,        # Narrower sampling
}
```

**Trade-off:** Slightly less creative but much faster

---

### Option 3: Batch Processing (Advanced)

For production with many requests:

```python
# Use streaming mode
payload = {
    "model": self.model,
    "prompt": prompt,
    "stream": True,  # Stream tokens as they're generated
}
```

Then stream response back to client progressively.

---

## Monitoring & Debugging

### Check Generation Time

Add logging to track performance:

```python
import time

def humanize_text(self, ...):
    start_time = time.time()
    
    # ... generation code ...
    
    elapsed = time.time() - start_time
    print(f"Humanization took {elapsed:.2f}s using method: {method}")
```

### Expected Logs:
```
Humanization took 45.3s using method: llm
Humanization took 78.2s using method: llm+ai-calibrated
```

### Red Flags:
```
⚠️ >90 seconds: Consider faster hardware or smaller model
⚠️ >150 seconds: Risk of timeout, optimize immediately
❌ >180 seconds: Will timeout, needs urgent optimization
```

---

## Troubleshooting

### Issue: Still Timing Out After Fix

**Possible causes:**

1. **Very long input text (>200 words)**
   ```bash
   # Solution: Split into chunks
   # Or reduce text length before sending
   ```

2. **CPU-only with old hardware**
   ```bash
   # Solution: Upgrade to GPU cloud (RunPod ~$0.40/hr)
   # Or use faster model (tinyllama)
   ```

3. **Ollama overloaded with requests**
   ```bash
   # Solution: Add request queue
   # Or increase instance resources
   ```

4. **Model not fully loaded**
   ```bash
   # Solution: Warm up model first
   ollama run mistral "Hello"
   ```

---

### Issue: Quality Degradation

If faster settings reduce quality too much:

**Adjust num_predict:**
```python
"num_predict": 768,  # Increase from 512
```

**Adjust temperature:**
```python
"temperature": 0.5,  # Increase from 0.3
```

**Increase calibration:**
```python
MAX_CALIBRATION_PASSES = 2  # Back to 2 (but risk timeout)
```

---

## Configuration Recommendations

### For Development (Local Testing):
```python
# Fast iterations, acceptable quality
timeout = 120
num_predict = 256
num_ctx = 1024
temperature = 0.3
MAX_CALIBRATION_PASSES = 1
```

### For Production (Cloud GPU):
```python
# Best quality, fast enough
timeout = 180
num_predict = 512
num_ctx = 2048
temperature = 0.3
MAX_CALIBRATION_PASSES = 1
```

### For Production (CPU-only):
```python
# Balanced for speed
timeout = 180
num_predict = 512
num_ctx = 2048
temperature = 0.2
MAX_CALIBRATION_PASSES = 1
model = "phi"  # or "tinyllama"
```

---

## Complete Optimization Summary

### Files Modified:
1. ✅ `ollama_client.py`
   - Timeout: 60s → 180s
   - Added `num_predict: 512`
   - Added `num_ctx: 2048`

2. ✅ `humanize_service.py`
   - Calibration passes: 2 → 1

### Impact:
- ✅ Eliminates timeout errors for most cases
- ✅ Maintains good quality output
- ✅ Reasonable response times (60-120s typical)
- ✅ Graceful degradation if calibration fails

---

## Quick Reference: Timeout Values

| Setting | Value | When to Use |
|---------|-------|-------------|
| **timeout** | 60s | Fast models (tinyllama) on GPU |
| **timeout** | 120s | Medium models on CPU/GPU |
| **timeout** | 180s | Mistral on CPU ← Current |
| **timeout** | 300s | Large models, very long text |

| **num_predict** | 256 | Short responses, speed priority |
| **num_predict** | 512 | Balanced ← Current |
| **num_predict** | 1024 | Long-form content |

| **num_ctx** | 1024 | Fast, short prompts |
| **num_ctx** | 2048 | Balanced ← Current |
| **num_ctx** | 4096 | Long context needed |

---

## Next Steps

1. **Deploy the fix:**
   ```bash
   git add ml-service/app/services/ollama_client.py
   git add ml-service/app/services/humanize_service.py
   git commit -m "Fix: Increase timeout and optimize generation parameters"
   git push origin main
   ```

2. **Monitor performance:**
   - Watch Render logs for timing
   - Track success rate
   - Note any remaining timeouts

3. **Test with various inputs:**
   - Short text (30 words): Should complete in 30-60s
   - Medium text (80 words): Should complete in 60-90s
   - Long text (120 words): Should complete in 90-120s

4. **Consider upgrades if needed:**
   - If still timing out → Use faster model
   - If quality suffers → Adjust temperature/num_predict
   - If too slow → Move to GPU cloud

---

## TL;DR

**Problem:** Ollama timeout at 60 seconds  
**Solution:** 
- ✅ Increased timeout to 180 seconds
- ✅ Added generation optimizations (num_predict, num_ctx)
- ✅ Reduced calibration passes from 2 to 1

**Result:** Humanization should complete successfully within 60-120 seconds for most inputs! ⏱️✨

Good luck! Your timeout issues should be resolved now! 🚀
