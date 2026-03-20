import { useState, useEffect } from 'react';

const GUEST_USAGE_KEY = 'verbalq_guest_usage';
const GUEST_IDENTIFIER_KEY = 'verbalq_guest_identifier';
const GUEST_LIMIT = 5;

export interface GuestUsageState {
  usageCount: number;
  limitReached: boolean;
  remainingUses: number;
  identifier: string | null;
}

/**
 * Hook to manage guest user usage tracking
 * Tracks usage across sessions using localStorage
 */
export function useGuestUsage() {
  const [usageState, setUsageState] = useState<GuestUsageState>({
    usageCount: 0,
    limitReached: false,
    remainingUses: 5,
    identifier: null,
  });

  // Initialize or load usage state on mount
  useEffect(() => {
    try {
      // Load usage count
      const storedUsage = localStorage.getItem(GUEST_USAGE_KEY);
      let storedIdentifier = localStorage.getItem(GUEST_IDENTIFIER_KEY);
      
      // Generate identifier if doesn't exist
      if (!storedIdentifier) {
        storedIdentifier = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(GUEST_IDENTIFIER_KEY, storedIdentifier);
      }
      
      let usageCount = 0;
      if (storedUsage) {
        usageCount = parseInt(storedUsage, 10);
      }

      const limitReached = usageCount >= GUEST_LIMIT;
      const remainingUses = Math.max(0, GUEST_LIMIT - usageCount);

      setUsageState({
        usageCount,
        limitReached,
        remainingUses,
        identifier: storedIdentifier,
      });
    } catch (error) {
      console.error('Failed to load guest usage:', error);
    }
  }, []);

  /**
   * Increment usage count after successful service use
   */
  const incrementUsage = () => {
    try {
      const newCount = usageState.usageCount + 1;
      localStorage.setItem(GUEST_USAGE_KEY, newCount.toString());
      
      setUsageState(prev => ({
        ...prev,
        usageCount: newCount,
        limitReached: newCount >= GUEST_LIMIT,
        remainingUses: Math.max(0, GUEST_LIMIT - newCount),
      }));
    } catch (error) {
      console.error('Failed to increment usage:', error);
    }
  };

  /**
   * Reset usage (called after successful signup/login)
   */
  const resetUsage = () => {
    try {
      localStorage.removeItem(GUEST_USAGE_KEY);
      localStorage.removeItem(GUEST_IDENTIFIER_KEY);
      
      setUsageState({
        usageCount: 0,
        limitReached: false,
        remainingUses: GUEST_LIMIT,
        identifier: null,
      });
    } catch (error) {
      console.error('Failed to reset usage:', error);
    }
  };

  /**
   * Set guest identifier (device fingerprint)
   */
  const setIdentifier = (identifier: string) => {
    try {
      localStorage.setItem(GUEST_IDENTIFIER_KEY, identifier);
      setUsageState(prev => ({
        ...prev,
        identifier,
      }));
    } catch (error) {
      console.error('Failed to set identifier:', error);
    }
  };

  return {
    ...usageState,
    incrementUsage,
    resetUsage,
    setIdentifier,
  };
}
