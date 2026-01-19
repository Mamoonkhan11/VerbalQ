"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
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

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (user && user.role === "admin") {
      router.push("/admin/dashboard")
    } else if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success && "role" in result) {
        // Check if user is admin
          if (result.role !== "admin") {
            // Remove server-side auth and client token so user is not treated as authenticated here.
            try {
              await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
            } catch (e) {
              // ignore
            }
            localStorage.removeItem("auth_token")

            toast({
              title: "🚫 Access Denied",
              description: "Admin access required. Your session has been cleared.",
              className: "border-orange-200 bg-transparent text-orange-800",
            })
            // Do not redirect to user dashboard — stay on admin login page
            setIsLoading(false)
            return
          }

        // Success - admin login
        toast({
          title: "✅ Admin Login Successful",
          description: "Redirecting to admin dashboard...",
          className: "border-green-200 bg-transparent text-green-800",
        })

        // Redirect will happen via useEffect when user state updates
      } else if ("error" in result) {
        const errorMessage = result.error || "Login failed. Please try again."
        setError(errorMessage)
        toast({
          title: "❌ Login Failed",
          description: errorMessage,
          className: "border-red-200 bg-transparent text-red-800",
        })
      }
    } catch (err: any) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({
        title: "⚠️ Error",
        description: errorMessage,
        className: "border-orange-200 bg-transparent text-orange-800",
      })
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            VerbalQ Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administrator access
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Admin Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your administrator credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-12 border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-12 border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Admin Sign In"
                )}
              </Button>
            </form>


            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Regular user?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                >
                  User Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
