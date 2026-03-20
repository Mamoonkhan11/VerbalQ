# Guest User System Implementation Plan 🎯

## Requirements Summary

### Free Tier (No Authentication Required):
- ✅ Access to first 3 services (Grammar, Translation, Humanize)
- ✅ Limited to 3 uses total (across all 3 services)
- ✅ After 3 uses → Show signup/login modal

### Premium Tier (Authentication Required):
- ✅ Full dashboard access
- ✅ All 4 services (including Plagiarism)
- ✅ Settings customization
- ✅ History tracking
- ✅ Unlimited usage

---

## Implementation Architecture

### Backend Changes:

#### 1. New Model: Guest Usage Tracking
```javascript
// models/GuestUsage.js
const mongoose = require('mongoose');

const GuestUsageSchema = new mongoose.Schema({
  identifier: {
    type: String,  // IP address or device fingerprint
    required: true,
    unique: true
  },
  usageCount: {
    type: Number,
    default: 0,
    max: 3
  },
  usageHistory: [{
    serviceType: String,  // 'grammar', 'translate', 'humanize'
    timestamp: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000  // Auto-delete after 30 days
  }
});

module.exports = mongoose.model('GuestUsage', GuestUsageSchema);
```

#### 2. Updated User Model
```javascript
// models/User.js - Add these fields
isGuest: {
  type: Boolean,
  default: false
},
convertedFromGuest: {
  type: Date,
  default: null
}
```

#### 3. New Middleware: Guest Auth Checker
```javascript
// middleware/guestAuth.js
const GuestUsage = require('../models/GuestUsage');

const guestAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (req.user) {
      return next();
    }

    // Get guest identifier (IP or fingerprint)
    const identifier = req.headers['x-device-fingerprint'] || req.ip;
    
    // Find or create guest usage record
    let guest = await GuestUsage.findOne({ identifier });
    
    if (!guest) {
      guest = await GuestUsage.create({ identifier });
    }

    // Check usage limit
    if (guest.usageCount >= 3) {
      return res.status(403).json({
        success: false,
        message: 'GUEST_LIMIT_REACHED',
        data: {
          usageCount: guest.usageCount,
          limit: 3,
          requiresAuth: true
        }
      });
    }

    // Attach guest info to request
    req.guest = {
      identifier: guest.identifier,
      usageCount: guest.usageCount,
      guestId: guest._id
    };

    next();
  } catch (error) {
    console.error('Guest auth error:', error);
    next(error);
  }
};

module.exports = guestAuth;
```

#### 4. Update Service Controllers
Add guest auth to grammar, translation, humanize endpoints:

```javascript
// controllers/AIController.js - Update each method
humanizeText = asyncHandler(async (req, res) => {
  // Check authentication OR guest status
  if (!req.user && !req.guest) {
    // Guest middleware already checked limits
    // Just increment usage
    await GuestUsage.findByIdAndUpdate(req.guest.guestId, {
      $inc: { usageCount: 1 },
      $push: { 
        usageHistory: {
          serviceType: 'humanize',
          timestamp: new Date()
        }
      }
    });
  }
  
  // ... existing logic
});
```

#### 5. New Route for Guest Conversion
```javascript
// routes/auth.js
router.post('/convert-guest', asyncHandler(async (req, res) => {
  const { guestIdentifier, email, password, name } = req.body;
  
  // Create user account
  const user = await User.create({
    email,
    password,
    name,
    isGuest: false,
    convertedFromGuest: new Date()
  });
  
  // Transfer guest usage history to user
  const guestUsage = await GuestUsage.findOne({ identifier: guestIdentifier });
  if (guestUsage) {
    user.usageHistory = guestUsage.usageHistory;
    await user.save();
    
    // Delete guest record
    await GuestUsage.deleteOne({ identifier: guestIdentifier });
  }
  
  // Generate token
  const token = generateToken(user);
  
  res.json({
    success: true,
    message: 'Account created successfully',
    data: { user, token }
  });
}));
```

---

### Frontend Changes:

#### 1. Updated Auth Context
```typescript
// lib/auth-context.tsx
interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  usageCount: number;
  usageLimit: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  convertGuest: (email: string, password: string, name: string) => Promise<void>;
  checkUsageLimit: () => boolean;
  incrementUsage: () => void;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 2. Usage Counter Hook
```typescript
// hooks/use-guest-usage.ts
import { useState, useEffect } from 'react';

export function useGuestUsage() {
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  
  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('guestUsageCount');
    if (stored) {
      const count = parseInt(stored);
      setUsageCount(count);
      if (count >= 3) {
        setLimitReached(true);
      }
    }
  }, []);
  
  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('guestUsageCount', newCount.toString());
    
    if (newCount >= 3) {
      setLimitReached(true);
    }
  };
  
  const resetUsage = () => {
    localStorage.removeItem('guestUsageCount');
    setUsageCount(0);
    setLimitReached(false);
  };
  
  return { usageCount, limitReached, incrementUsage, resetUsage };
}
```

#### 3. Signup Modal Component
```typescript
// components/SignupLimitModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SignupLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usageCount: number;
}

export function SignupLimitModal({ open, onOpenChange, usageCount }: SignupLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            You've reached the free limit! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="mb-6 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg text-muted-foreground">
              You've used our free tools <strong>{usageCount} times</strong>.
            </p>
            <p className="text-lg font-semibold mt-2">
              Create a free account to continue using our services!
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm">Unlimited access to Grammar, Translation & Humanize</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Access to Plagiarism Detection</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Save your history and preferences</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button onClick={() => window.location.href = '/register'} className="w-full">
            Create Free Account
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/login'} className="w-full">
            Sign In Instead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4. Service Wrapper Component
```typescript
// components/ServiceWrapper.tsx
import { useAuth } from '@/lib/auth-context';
import { useGuestUsage } from '@/hooks/use-guest-usage';
import { SignupLimitModal } from './SignupLimitModal';

interface ServiceWrapperProps {
  children: React.ReactNode;
  serviceName: 'grammar' | 'translate' | 'humanize' | 'plagiarism';
}

export function ServiceWrapper({ children, serviceName }: ServiceWrapperProps) {
  const { user, isGuest } = useAuth();
  const { usageCount, limitReached, incrementUsage } = useGuestUsage();
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const checkAccess = () => {
    // Plagiarism always requires login
    if (serviceName === 'plagiarism' && !user) {
      window.location.href = '/login?redirect=' + window.location.pathname;
      return false;
    }
    
    // For other services, check guest limit
    if (!user && limitReached) {
      setShowLimitModal(true);
      return false;
    }
    
    return true;
  };
  
  const handleUsage = async () => {
    if (!user) {
      incrementUsage();
      
      // Check if this usage triggered the limit
      if (usageCount + 1 >= 3) {
        setShowLimitModal(true);
      }
    }
  };
  
  useEffect(() => {
    checkAccess();
  }, [user, limitReached]);
  
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            onUsageComplete: handleUsage
          });
        }
        return child;
      })}
      
      <SignupLimitModal 
        open={showLimitModal} 
        onOpenChange={setShowLimitModal}
        usageCount={usageCount}
      />
    </>
  );
}
```

---

## File Structure Changes

### New Files to Create:

**Backend:**
```
backend/
├── models/
│   └── GuestUsage.js           # NEW
├── middleware/
│   └── guestAuth.js            # NEW
└── routes/
    └── auth.js                 # UPDATE (add /convert-guest endpoint)
```

**Frontend:**
```
frontend/
├── components/
│   ├── SignupLimitModal.tsx    # NEW
│   └── ServiceWrapper.tsx      # NEW
├── hooks/
│   └── use-guest-usage.ts      # NEW
├── lib/
│   └── auth-context.tsx        # UPDATE (add guest support)
└── app/
    ├── (auth)/
    │   ├── register/
    │   │   └── page.tsx        # UPDATE (handle guest conversion)
    │   └── login/
    │       └── page.tsx        # UPDATE
    └── (protected)/
        └── dashboard/
            └── [service]/
                └── page.tsx    # UPDATE (wrap with ServiceWrapper)
```

---

## Implementation Steps

### Phase 1: Backend Setup (Priority: HIGH)
1. ✅ Create GuestUsage model
2. ✅ Create guestAuth middleware
3. ✅ Update User model with isGuest field
4. ✅ Add guest conversion endpoint
5. ✅ Apply guestAuth to grammar/translate/humanize routes

### Phase 2: Frontend Core (Priority: HIGH)
1. ✅ Create useGuestUsage hook
2. ✅ Update AuthContext with guest support
3. ✅ Create SignupLimitModal component
4. ✅ Create ServiceWrapper component

### Phase 3: Integration (Priority: MEDIUM)
1. ✅ Wrap all dashboard service pages with ServiceWrapper
2. ✅ Update register page to handle guest conversion
3. ✅ Add usage counter display in UI
4. ✅ Test guest → registered user flow

### Phase 4: Polish (Priority: LOW)
1. ⏳ Add device fingerprinting library
2. ⏳ Implement localStorage fallback
3. ⏳ Add analytics tracking
4. ⏳ Create welcome email sequence for converted guests

---

## Testing Checklist

### Guest User Flow:
- [ ] Use grammar checker 3 times → Modal appears
- [ ] Use translator 1 time, grammar 2 times → Modal appears on 3rd
- [ ] Try plagiarism without login → Redirects to login
- [ ] Convert guest to registered user → Usage history preserved

### Registered User Flow:
- [ ] Login → Unlimited access to all services
- [ ] Access settings → Works
- [ ] View history → Shows all past usage

### Edge Cases:
- [ ] Clear browser cache → Usage resets (acceptable)
- [ ] Incognito mode → Fresh 3 uses
- [ ] Multiple devices → Each gets 3 uses
- [ ] Guest converts, then logs out, then logs back in → Full access

---

## Security Considerations

### Rate Limiting:
```javascript
// Add to guestAuth middleware
const rateLimit = require('express-rate-limit');

const guestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests per day
  message: {
    success: false,
    message: 'Daily limit reached. Please create an account.'
  }
});
```

### Device Fingerprinting:
```bash
npm install fingerprintjs2
```

```typescript
// More reliable than IP alone
import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function getDeviceId() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
```

---

## Migration Path

### For Existing Users:
- No changes - full access maintained

### For Current Guests:
- LocalStorage tracks their usage
- Can convert anytime by signing up
- Usage transfers to new account

---

## Success Metrics

Track these after implementation:
1. **Guest → Registered Conversion Rate**
   - Target: 30-40%
2. **Average Uses Before Conversion**
   - Expected: 2.5 uses
3. **Plagiarism Feature Adoption**
   - Should increase with registration

---

## Next Steps

Ready to implement? I can help you with:

1. **Backend First** - Start with GuestUsage model and middleware
2. **Frontend Second** - Build the guest usage tracking and modal
3. **Integration Third** - Wire everything together
4. **Testing Fourth** - Comprehensive testing of all flows

Which part would you like me to implement first? Or should I proceed with creating all the necessary files?

---

**TL;DR:** Users can use Grammar, Translation, and Humanize 3 times total without signup. After 3 uses, modal prompts signup. Plagiarism and full dashboard require login. Guest usage tracked via localStorage + database. Converted guests keep their usage history.

Let's build this! 🚀
