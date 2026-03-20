"use client"

import { useGuestUsage } from "@/hooks/use-guest-usage"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function GuestUsageBadge() {
  const { usageCount, remainingUses, limitReached } = useGuestUsage()
  
  if (limitReached) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="cursor-help">
              ⚠️ Free limit reached
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-sm">Sign up to continue using our services</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  if (usageCount > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-help">
              {remainingUses} free {remainingUses === 1 ? 'use' : 'uses'} left
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-sm">Create a free account for unlimited access</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  // First time user - show welcome badge
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✨ 3 free uses available
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">Try our services free! Sign up after 3 uses for unlimited access.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
