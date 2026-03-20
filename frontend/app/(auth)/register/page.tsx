import { Suspense } from "react"
import RegisterFormContent from "./RegisterFormContent"

// Loading skeleton for Suspense fallback
function RegisterSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="w-full max-w-lg">
        {/* Skeleton Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-6 animate-pulse"></div>
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto mb-3 animate-pulse"></div>
          <div className="h-6 w-80 bg-slate-200 dark:bg-slate-800 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Skeleton Card */}
        <div className="border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-slate-200 dark:bg-slate-800" />
          <div className="p-8 space-y-6">
            {/* Skeleton Form Fields */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded ml-1 animate-pulse"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded ml-1 animate-pulse"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded ml-1 animate-pulse"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded ml-1 animate-pulse"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            {/* Skeleton Button */}
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterFormContent fromLimit={false} />
    </Suspense>
  )
}
