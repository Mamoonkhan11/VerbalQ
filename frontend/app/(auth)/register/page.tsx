"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const newFieldErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newFieldErrors.name = "Full name is required"
    if (!formData.email.trim()) newFieldErrors.email = "Email is required"
    else if (!emailRegex.test(formData.email)) newFieldErrors.email = "Invalid email format"

    if (formData.password.length < 6) newFieldErrors.password = "Min 6 characters"
    if (formData.password !== formData.confirmPassword) newFieldErrors.confirmPassword = "Passwords match error"

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      setError("Please fix the errors below")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || "Registration failed")
        return
      }

      toast({
        title: "✅ Account Created",
        description: "Welcome to VerbalQ! Redirecting to login...",
        className: "border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200",
      })

      setTimeout(() => {
        router.push("/login")
      }, 1500)

    } catch (err: any) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="w-full max-w-lg">
        {/* Back to Login */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-8 transition-colors group"
        >
          <div className="mr-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to login
        </Link>

        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl ring-4 ring-white dark:ring-slate-900 -rotate-3 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Join VerbalQ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Create your account to start improving your writing
          </p>
        </div>

        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardHeader className="space-y-1 pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Create Account</CardTitle>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200/50 bg-red-50/50 dark:bg-red-950/20">
                  <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base"
                />
                {fieldErrors.name && <p className="text-xs text-red-500 ml-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base"
                />
                {fieldErrors.email && <p className="text-xs text-red-500 ml-1">{fieldErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-500 ml-1">{fieldErrors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Confirm
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500 ml-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:translate-y-0"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Free Account"
                  )}
                </Button>
              </div>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Already a member?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-12 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                Sign In to Your Account
              </Link>
            </div>
          </CardContent>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed">
              By creating an account, you agree to our <span className="text-slate-900 dark:text-slate-200 font-bold">Terms of Service</span> and <span className="text-slate-900 dark:text-slate-200 font-bold">Privacy Policy</span>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
