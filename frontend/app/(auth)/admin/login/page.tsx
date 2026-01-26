"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Lock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)

  // Redirect if already authenticated as admin.
  useEffect(() => {
    if (user && user.role === "admin") {
      router.push("/admin/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(email, password, "admin")

      if (result.success && "role" in result) {
        // Check if user is admin
        if (result.role !== "admin") {
          const deniedMsg = "Access denied. You do not have admin privileges."
          setError(deniedMsg)
          toast({
            variant: "destructive",
            title: "🚫 Access Denied",
            description: deniedMsg,
          })
          setIsLoading(false)
          return
        }

        // Success - admin login
        toast({
          title: "✅ Admin Login Successful",
          description: "Authorized access granted. Redirecting...",
          className: "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
        })

        router.push("/admin/dashboard")
      } else {
        const errorMessage = result.error || "Login failed. Please try again."
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "❌ Login Failed",
          description: errorMessage,
        })
        setIsLoading(false)
      }
    } catch (err: any) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "⚠️ Error",
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="w-full max-w-lg">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-3xl mb-6 shadow-2xl shadow-orange-500/20 ring-4 ring-white dark:ring-slate-900 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Admin Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Restricted access for authorized administrators only
          </p>
        </div>

        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardHeader className="space-y-1 pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Admin Sign In</CardTitle>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-center">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@verbalq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-slate-950 transition-all text-base"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Admin Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-slate-950 transition-all text-base pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => {
                      setShowPassword(!showPassword)
                      passwordInputRef.current?.focus()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Authorize Access"
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-slate-500">
                Not an administrator?{" "}
                <Link
                  href="/login"
                  className="font-bold text-amber-600 hover:text-amber-500 dark:text-amber-400 transition-colors underline underline-offset-4"
                >
                  Standard Login
                </Link>
              </p>
            </div>
          </CardContent>
          
          <div className="px-8 py-4 bg-amber-500/10 dark:bg-amber-500/5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500/80">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Secure Administrator Environment
              </p>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          Authorized personnel only. All access attempts are logged and monitored.
        </p>
      </div>
    </div>
  )
}
