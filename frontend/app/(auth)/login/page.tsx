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
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!login || typeof login !== 'function') {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Authentication service is not available. Please refresh the page.",
        })
        setIsLoading(false)
        return
      }

      const result = await login(email, password, "user")

      if (result.success && "role" in result) {
        if (rememberMe) {
          localStorage.setItem('verbalq_remember_me', 'true')
        } else {
          localStorage.removeItem('verbalq_remember_me')
        }

        toast({
          title: " Login Successful",
          description: "Welcome back! Redirecting...",
          className: "border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200",
        })

        router.push(result.role === "admin" ? "/admin/dashboard" : "/dashboard")
        return
      } else {
        const errorMessage = result.error || "Login failed. Please try again."
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: " Login Failed",
          description: errorMessage,
        })
        setIsLoading(false)
      }
    } catch (err: any) {
      const errorMessage = err?.message || "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: " Error",
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl ring-4 ring-white dark:ring-slate-900 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-black text-2xl tracking-tighter">VQ</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Enter your details to access your dashboard
          </p>
        </div>

        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardHeader className="space-y-1 pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Sign In</CardTitle>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <Link href="/forgot-password" title="Request password reset" className="text-sm font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
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
                    className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base pr-12"
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

              <div className="flex items-center space-x-3 ml-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Remember my session
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In to VerbalQ"
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">New to VerbalQ?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
