"use client"

import { CheckCircle, Lock, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SignupLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usageCount: number
}

export function SignupLimitModal({ open, onOpenChange, usageCount }: SignupLimitModalProps) {
  const handleCreateAccount = () => {
    window.location.href = "/register?from=limit"
  }

  const handleSignIn = () => {
    window.location.href = "/login?from=limit"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            You've reached the free limit! 🎉
          </DialogTitle>
          <DialogDescription className="pt-2">
            Create a free account to continue using our services
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Success Message */}
          <div className="mb-6 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg text-muted-foreground">
              You've used our free tools <strong className="text-foreground">{usageCount} times</strong>.
            </p>
            <p className="text-lg font-semibold mt-3 text-foreground">
              Sign up now for unlimited access!
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Unlimited access to Grammar, Translation & Humanize
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Access to Plagiarism Detection & AI Analysis
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-purple-800 dark:text-purple-200">
                Save your history and customize preferences
              </span>
            </div>
          </div>

          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Free Forever
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Create an account today and get unlimited access to all features - completely free!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleCreateAccount} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            Create Free Account
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignIn} 
            className="w-full"
            size="lg"
          >
            Sign In Instead
          </Button>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            No credit card required • Free forever
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
