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
  const { user, incrementUsage } = useAuth()
  const { usageCount, limitReached } = useGuestUsage()
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false)
  
  // Check if service requires authentication on mount
  useEffect(() => {
    // Plagiarism always requires login
    if (serviceName === 'plagiarism' && !user) {
      const currentPath = encodeURIComponent(window.location.pathname)
      router.push(`/login?redirect=${currentPath}`)
      return
    }
    
    // For other services, check guest limit
    if (!user && limitReached && !hasShownModal) {
      setShowLimitModal(true)
      setHasShownModal(true)
    }
  }, [user, limitReached, serviceName, router, hasShownModal])
  
  // Listen for API errors indicating limit reached
  useEffect(() => {
    const handleGuestLimitReached = () => {
      if (!user && !hasShownModal) {
        setShowLimitModal(true)
        setHasShownModal(true)
      }
    }
    
    window.addEventListener('guest-limit-reached', handleGuestLimitReached)
    return () => window.removeEventListener('guest-limit-reached', handleGuestLimitReached)
  }, [user, hasShownModal])
  
  // Track usage when service is used (expose via custom event)
  const handleServiceUse = () => {
    if (!user) {
      incrementUsage()
      
      // Show modal if this was the 3rd use
      if (usageCount + 1 >= 3 && !hasShownModal) {
        setShowLimitModal(true)
        setHasShownModal(true)
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
