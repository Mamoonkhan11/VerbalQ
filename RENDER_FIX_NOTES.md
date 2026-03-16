# Render Deployment Fix - Error 127

## Problem
```
npm error code 127
npm error command sh -c cross-env NODE_ENV=production node server.js
```

**Cause:** `cross-env` was in `devDependencies` but Render only installs `dependencies` for production.

## Solution Applied ✅

Moved `cross-env` from `devDependencies` to `dependencies` in `package.json`.

## Alternative Solutions

If you prefer NOT to use cross-env, here are alternatives:

### Option 1: Use Native Node.js (No cross-env needed)

Update your `server.js` at the very top:

```javascript
// First line of server.js
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const express = require('express');
// ... rest of your code
```

Then update `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Option 2: Use inline shell script

In `package.json`:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "dev": "NODE_ENV=development nodemon server.js"
  }
}
```

⚠️ **Note:** This works on Linux/Mac (including Render) but not Windows. For cross-platform, keep using `cross-env`.

### Option 3: Set NODE_ENV in Render Dashboard

Instead of setting it in the start command:

1. Go to Render Dashboard → Your Service → Environment
2. Add variable:
   ```
   Key: NODE_ENV
   Value: production
   ```
3. Update `package.json`:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

This is actually the **cleanest approach**!

## Recommended Approach

**Best Practice:** Use Option 3 - Set environment variables in Render dashboard, not in package.json scripts.

### Updated package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "axios": "^1.13.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "cross-env": "^10.1.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2"
  }
}
```

This way:
- ✅ No need for `cross-env` in production
- ✅ Cleaner scripts
- ✅ Environment variables managed by platform
- ✅ Works everywhere

## Next Steps

After committing the fix:

1. **Commit changes:**
   ```bash
   git add backend/package.json
   git commit -m "Fix: Move cross-env to dependencies for Render deployment"
   git push origin main
   ```

2. **Render will auto-redeploy**
   - Watch the logs in Render dashboard
   - Should complete successfully this time

3. **Verify deployment:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

## Why This Happened

Render's build process:
1. Runs `npm install --only=production` 
2. This installs ONLY `dependencies`, not `devDependencies`
3. Your start script tried to use `cross-env` which wasn't installed
4. Result: Error 127 (command not found)

**Lesson:** Anything used in npm scripts must be in `dependencies`, not `devDependencies`.

---

**Status:** ✅ Fixed by moving `cross-env` to dependencies  
**Alternative:** Set `NODE_ENV` in Render dashboard and remove `cross-env` entirely
