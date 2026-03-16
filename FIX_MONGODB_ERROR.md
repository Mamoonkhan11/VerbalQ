# Fix MongoDB Connection Error 🗄️

## Error Analysis

```
Mongoose disconnected
Database connection error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

**Cause:** Your MongoDB URI is invalid or pointing to a cluster that doesn't exist.

---

## Solution: Update MongoDB URI

### Step 1: Get Your Correct MongoDB URI

#### If You Have MongoDB Atlas Set Up:

1. **Login to MongoDB Atlas:**
   - Go to https://cloud.mongodb.com/
   - Login with your credentials

2. **Navigate to Your Cluster:**
   - Click "Database" in left sidebar
   - You should see your cluster listed

3. **Get Connection String:**
   - Click **"Connect"** button on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string

4. **Important - Replace Placeholders:**
   
   The default looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
   
   You MUST replace:
   - `<username>` → Your actual database username
   - `<password>` → Your actual database password  
   - `<dbname>` → Your database name (e.g., `verbalq`)

   **Example (CORRECT):**
   ```
   mongodb+srv://verbalqadmin:MySecurePass123@cluster0.abc123.mongodb.net/verbalq?retryWrites=true&w=majority
   ```

#### If You Don't Have MongoDB Atlas Yet:

1. **Create Free Cluster:**
   - Go to https://cloud.mongodb.com/
   - Sign up/login
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Select region closest to you (Oregon for US)
   - Click "Create"

2. **Create Database User:**
   - Click "Database Access" in left sidebar
   - "Add New Database User"
   - Username: `verbalqadmin`
   - Password: (choose strong password, save it!)
   - Role: "Atlas admin"
   - Click "Add User"

3. **Allow Network Access:**
   - Click "Network Access"
   - "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String:**
   - Go back to "Database"
   - Click "Connect" on your cluster
   - "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `verbalq`

---

### Step 2: Update Render Environment Variable

1. **Go to Render Dashboard:**
   - https://dashboard.render.com/
   - Click on your **backend** service

2. **Navigate to Environment:**
   - Click "Environment" tab

3. **Find MONGODB_URI:**
   - Look for the variable `MONGODB_URI`
   - Click "Edit"

4. **Paste Correct URI:**
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://verbalqadmin:YourPassword123@cluster0.abc123.mongodb.net/verbalq?retryWrites=true&w=majority
   ```

5. **Save Changes:**
   - Click "Save Changes"
   - Service will auto-redeploy

---

### Step 3: Verify Deployment

Wait 2-3 minutes for deployment, then test:

```bash
curl https://your-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "uptime": "0h 0m 30s",
  ...
}
```

---

## Common Mistakes

### ❌ Wrong: Using Placeholder
```
mongodb+srv://<username>:<password>@cluster0...
```
The `<` and `>` are placeholders! Remove them!

### ✅ Correct: Actual Values
```
mongodb+srv://verbalqadmin:MyPassword123@cluster0.abc123.mongodb.net/verbalq
```

### ❌ Wrong: Special Characters Not Encoded
If your password contains special characters like `@`, `#`, `$`, etc., you must URL-encode them:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

**Example:**
```
Password: MyP@ssw0rd#123
Encoded:  MyP%40ssw0rd%23123

URI: mongodb+srv://user:MyP%40ssw0rd%23123@cluster...
```

### ❌ Wrong: Missing Database Name
```
mongodb+srv://user:pass@cluster0.mongodb.net/
```
Missing `<dbname>`! Add it:
```
mongodb+srv://user:pass@cluster0.mongodb.net/verbalq
```

---

## Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier)
- [ ] Database user created with password
- [ ] Network access allows 0.0.0.0/0
- [ ] Connection string copied
- [ ] `<password>` replaced with actual password
- [ ] `<dbname>` replaced with `verbalq`
- [ ] No special character encoding issues
- [ ] Updated in Render environment variables
- [ ] Saved and redeployed

---

## Testing Locally (Optional)

Before deploying, test locally:

1. **Create `.env` in backend folder:**
   ```env
   MONGODB_URI=mongodb+srv://verbalqadmin:YourPassword@cluster.mongodb.net/verbalq
   JWT_SECRET=your-secret-key-here
   ML_SERVICE_URL=https://your-ml-service.onrender.com
   PORT=5000
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

Should connect successfully!

---

## Still Having Issues?

### Check MongoDB Atlas Dashboard

1. Go to https://cloud.mongodb.com/
2. Click "Database"
3. Your cluster should show "Active" status
4. If not, there may be an issue with your cluster

### Check Network Access

1. Go to "Network Access"
2. Ensure you have 0.0.0.0/0 allowed
3. Or add Render's IP addresses if you want to restrict

### Check User Permissions

1. Go to "Database Access"
2. Verify your user exists
3. Edit user, ensure has "Read and write to any database" permission

### Try Simple Connection Test

From your computer:
```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/verbalq"
```

If this fails, the issue is with your MongoDB setup, not Render.

---

## Alternative: Use Compose MongoDB (If Atlas Fails)

If MongoDB Atlas is giving you trouble, you can use Render's built-in PostgreSQL or other databases, but you'll need to modify your schema. MongoDB Atlas is recommended for this project.

---

## Expected Result After Fix

Once you update the correct MongoDB URI:

```
✅ Environment variables validated successfully
Mongoose connected successfully to MongoDB Atlas
Server running on port 5000
```

Then test:
```bash
curl https://your-backend.onrender.com/api/health
```

Success! 🎉

---

**TL;DR:** Your MongoDB URI is wrong. Get the correct one from MongoDB Atlas dashboard, replace placeholders with actual values, update in Render environment variables, and redeploy.

Good luck! 🗄️
