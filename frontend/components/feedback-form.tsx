"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageSquareHeart } from "lucide-react"

export default function FeedbackForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Feedback Sent! 🚀",
          description: "Thank you for your valuable feedback. We appreciate your input!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-200",
        })
        setFormData({ name: "", email: "", message: "" })
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Visual/Text */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                  <MessageSquareHeart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">We’d love your feedback</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Help us make VerbalQ better. Whether it's a feature request, a bug report, or just a friendly hello, we're all ears.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-300" />
                    <p className="text-sm font-medium text-blue-100">Directly read by our product team</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-300" />
                    <p className="text-sm font-medium text-blue-100">Response within 24-48 hours</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fb-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                    <Input
                      id="fb-name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fb-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                    <Input
                      id="fb-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fb-message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Message</Label>
                    <Textarea
                      id="fb-message"
                      placeholder="Tell us what you think..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Submit Feedback</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Label({ children, htmlFor, className }: { children: React.ReactNode, htmlFor: string, className?: string }) {
  return <label htmlFor={htmlFor} className={className}>{children}</label>
}
