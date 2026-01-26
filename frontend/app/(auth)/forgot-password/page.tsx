"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Reset Link Sent",
          description: "Check your email for instructions.",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        setError(data.message || "Failed to send reset link")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="w-full max-w-lg">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-8 transition-colors group"
        >
          <div className="mr-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to login
        </Link>

        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardHeader className="space-y-1 pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6 space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="rounded-2xl border-red-200/50 bg-red-50/50 dark:bg-red-950/20">
                    <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-14 px-4 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-950 transition-all text-base"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all"
                >
                  {isLoading ? "Sending Instructions..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check your inbox</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    We've sent password reset instructions to <br />
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{email}</span>
                  </p>
                </div>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-slate-200 dark:border-slate-800"
                >
                  <Link href="/login">Return to Login</Link>
                </Button>
                <p className="text-sm text-slate-500">
                  Didn't receive the email?{" "}
                  <button onClick={() => setIsSubmitted(false)} className="font-bold text-blue-600 hover:underline">
                    Try another email
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
