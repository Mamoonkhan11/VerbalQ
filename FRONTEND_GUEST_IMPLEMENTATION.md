# Frontend Guest User Implementation Guide 🎨

## Overview

This guide shows you how to integrate the guest user system into your Next.js frontend.

---

## Files Created (Backend ✅)

### Backend - Already Implemented:
- ✅ `backend/models/GuestUsage.js` - Guest tracking model
- ✅ `backend/middleware/guestAuth.js` - Guest authentication middleware  
- ✅ `backend/controllers/AuthController.js` - Updated with convertGuest method
- ✅ `backend/routes/auth.js` - Added /convert-guest endpoint
- ✅ `backend/routes/ai.js` - Updated grammar/translate/humanize routes
- ✅ `backend/controllers/AIController.js` - Tracks guest usage

### Frontend - Need to Implement:
- ⏳ `frontend/hooks/use-guest-usage.ts` - ✅ CREATED
- ⏳ `frontend/components/SignupLimitModal.tsx` - ✅ CREATED
- ⏳ Update `frontend/lib/auth-context.tsx` - TODO
- ⏳ Update dashboard service pages - TODO
- ⏳ Update register page - TODO

---

## Step 1: Update Auth Context

**File:** `frontend/lib/auth-context.tsx`

Add guest support to your auth context:

```typescript
// Add these imports
import { useGuestUsage } from '@/hooks/use-guest-usage';

// Update AuthContextType interface
interface AuthContextType {
  user: User | null;
  isGuest: boolean;  // ADD THIS
  usageCount: number;  // ADD THIS
  limitReached: boolean;  // ADD THIS
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  convertGuest: (name: string, email: string, password: string) => Promise<void>;  // ADD THIS
  logout: () => void;
  incrementUsage: () => void;  // ADD THIS
}

// In your AuthProvider component:
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { usageCount, limitReached, incrementUsage, resetUsage } = useGuestUsage();
  
  
  const convertGuest = async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/convert-guest', {
      name,
      email,
      password,
      guestIdentifier: localStorage.getItem('verbalq_guest_identifier')
    });
    
    const { data } = response.data;
    localStorage.setItem('token', data.token);
    setUser(data.user);
    resetUsage();  // Clear guest tracking
  };
  
  const value = {
    user,
    isGuest: !user,  // If no user, they're a guest
    usageCount,
    limitReached,
    login,
    signup,
    convertGuest,
    logout,
    incrementUsage,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Step 2: Create Service Wrapper Component

**File:** `frontend/components/ServiceWrapper.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useGuestUsage } from "@/hooks/use-guest-usage"
import { SignupLimitModal } from "./SignupLimitModal"
import { useRouter } from "next/navigation"

interface ServiceWrapperProps {
  children: React.ReactNode
  serviceName: 'grammar' | 'translate' | 'humanize' | 'plagiarism'
}

export function ServiceWrapper({ children, serviceName }: ServiceWrapperProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { usageCount, limitReached, incrementUsage } = useGuestUsage()
  const [showLimitModal, setShowLimitModal] = useState(false)
  
  // Check if service requires authentication
  useEffect(() => {
    // Plagiarism always requires login
    if (serviceName === 'plagiarism' && !user) {
      router.push(`/login?redirect=/dashboard/${serviceName}`)
      return
    }
    
    // For other services, check guest limit
    if (!user && limitReached) {
      setShowLimitModal(true)
      return
    }
  }, [user, limitReached, serviceName, router])
  
  // Track usage when service is used
  const handleServiceUse = () => {
    if (!user) {
      incrementUsage()
      
      // Show modal if this was the 3rd use
      if (usageCount + 1 >= 3) {
        setShowLimitModal(true)
      }
    }
  }
  
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            onServiceUse: handleServiceUse
          })
        }
        return child
      })}
      
      <SignupLimitModal 
        open={showLimitModal} 
        onOpenChange={setShowLimitModal}
        usageCount={usageCount}
      />
    </>
  )
}
```

---

## Step 3: Update Dashboard Pages

### Example: Grammar Checker Page

**File:** `frontend/app/(protected)/dashboard/grammar/page.tsx`

Wrap your existing page with ServiceWrapper:

```typescript
"use client"

import { ServiceWrapper } from "@/components/ServiceWrapper"
import YourGrammarCheckerComponent from "./grammar-checker-component"

export default function GrammarPage() {
  return (
    <ServiceWrapper serviceName="grammar">
      <YourGrammarCheckerComponent />
    </ServiceWrapper>
  )
}
```

### Do the same for:
- `frontend/app/(protected)/dashboard/translate/page.tsx`
- `frontend/app/(protected)/dashboard/humanize/page.tsx`
- `frontend/app/(protected)/dashboard/plagiarism/page.tsx` ← Will redirect to login

---

## Step 4: Update Register Page

**File:** `frontend/app/(auth)/register/page.tsx`

Add guest conversion logic:

```typescript
"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { convertGuest } = useAuth()
  
  const fromLimit = searchParams.get('from') === 'limit'
  
  // If coming from limit modal, pre-fill conversion form
  useEffect(() => {
    if (fromLimit) {
      // Show special messaging
      console.log("Converting from guest to registered user")
    }
  }, [fromLimit])
  
  const handleSubmit = async (data: RegisterFormData) => {
    try {
      if (fromLimit) {
        // Convert guest account
        await convertGuest(data.name, data.email, data.password)
      } else {
        // Regular registration
        await signup(data.name, data.email, data.password)
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    }
  }
  
  return (
    <div>
      {fromLimit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            ✨ Create an account to preserve your usage history and unlock unlimited access!
          </p>
        </div>
      )}
      
      {/* Your existing registration form */}
    </div>
  )
}
```

---

## Step 5: Add Usage Counter Display (Optional)

Create a small badge showing remaining uses:

**File:** `frontend/components/GuestUsageBadge.tsx`

```typescript
"use client"

import { useGuestUsage } from "@/hooks/use-guest-usage"
import { Badge } from "@/components/ui/badge"

export function GuestUsageBadge() {
  const { usageCount, remainingUses, limitReached } = useGuestUsage()
  
  if (limitReached) {
    return (
      <Badge variant="destructive">
        Free limit reached • Sign up to continue
      </Badge>
    )
  }
  
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      {remainingUses} free {remainingUses === 1 ? 'use' : 'uses'} remaining
    </Badge>
  )
}
```

Use it in your navbar or dashboard pages:

```typescript
import { GuestUsageBadge } from "@/components/GuestUsageBadge"

// In your layout or page:
{!user && <GuestUsageBadge />}
```

---

## Step 6: Handle API Errors

Update your API error handler to show the limit modal:

**File:** `frontend/lib/api.ts` or wherever you handle errors

```typescript
import axios from 'axios'
import { useGuestUsage } from '@/hooks/use-guest-usage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.message === 'GUEST_LIMIT_REACHED') {
      // Trigger limit modal
      window.dispatchEvent(new CustomEvent('guest-limit-reached'))
    }
    
    return Promise.reject(error)
  }
)

export default api
```

---

## Testing Checklist

### Guest User Flow:
- [ ] Visit site without logging in
- [ ] Use grammar checker → Should work
- [ ] Use translator → Should work
- [ ] Use humanizer → Should work
- [ ] Try 4th time → Modal should appear
- [ ] Click "Create Free Account" → Redirects to register
- [ ] Register → Should convert guest and preserve history

### Registered User Flow:
- [ ] Login → Full access to all features
- [ ] Use any service → No limits
- [ ] Access plagiarism → Works
- [ ] Access settings → Works

### Edge Cases:
- [ ] Clear browser cache → Usage resets
- [ ] Incognito mode → Fresh 3 uses
- [ ] Logout after converting → Can log back in with full access

---

## Common Issues & Solutions

### Issue 1: Modal doesn't appear
**Solution:** Make sure you're calling `incrementUsage()` after successful service use

### Issue 2: Usage not tracked
**Solution:** Check localStorage keys match: `verbalq_guest_usage`

### Issue 3: Plagiarism accessible without login
**Solution:** ServiceWrapper checks `serviceName === 'plagiarism'` and redirects

### Issue 4: Guest converts but usage lost
**Solution:** Ensure `convertGuest` endpoint transfers usageHistory before deleting guest record

---

## Migration Steps

### Phase 1: Core Infrastructure (Do This First)
1. ✅ Deploy backend changes
2. ✅ Test guest endpoints with Postman
3. ✅ Verify guest tracking works in database

### Phase 2: Frontend Integration
1. Copy hooks and components from this guide
2. Update auth context
3. Wrap dashboard pages with ServiceWrapper
4. Test guest flow end-to-end

### Phase 3: Polish & Testing
1. Add usage counter badge
2. Style the limit modal
3. Test all edge cases
4. Deploy to production

---

## Success Metrics

After deployment, track:
- **Guest → Registered Conversion Rate**: Target 30-40%
- **Average Uses Before Conversion**: Expect ~2.5
- **Plagiarism Feature Adoption**: Should increase

---

## Quick Start Commands

```bash
# 1. Install dependencies (if needed)
cd frontend
pnpm install

# 2. Create the files
# (Copy code from this guide)

# 3. Test locally
pnpm dev

# 4. Open browser
# http://localhost:3000
# Try using services without logging in!
```

---

## TL;DR

**What You Need to Do:**
1. ✅ Backend is DONE
2. ⏳ Copy frontend code from this guide
3. ⏳ Wrap your dashboard pages
4. ⏳ Update register page
5. ⏳ Test everything

**Result:** Users can try 3 times free, then must sign up!

Good luck! 🚀
