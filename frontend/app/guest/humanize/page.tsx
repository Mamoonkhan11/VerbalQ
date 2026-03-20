"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, ArrowLeft, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useGuestUsage } from "@/hooks/use-guest-usage"
import api from "@/lib/api"
import Link from "next/link"
import { SignupLimitModal } from "@/components/SignupLimitModal"

export default function GuestHumanizePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { incrementUsage, limitReached, identifier } = useGuestUsage()
  const [isClient, setIsClient] = useState(false)
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard/humanize")
    }
  }, [user, router])

  // Listen for limit event
  useEffect(() => {
    const handleLimitReached = () => {
      setShowLimitModal(true)
    }
    window.addEventListener('guest-limit-reached', handleLimitReached)
    return () => window.removeEventListener('guest-limit-reached', handleLimitReached)
  }, [])

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text to humanize",
        className: "bg-white text-black border-gray-200",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use identifier from hook (guaranteed to exist after initialization)
      const guestIdentifier = identifier || 'unknown'

      const response = await api.post("/api/ai/humanize", {
        text: inputText,
        language: "en",
        tone: "casual"
      }, {
        headers: {
          'X-Device-Fingerprint': guestIdentifier
        }
      })
      const data = response.data

      if (!data.success) {
        throw new Error(data.message || "Humanization failed")
      }

      setOutputText(data.data.humanizedText || inputText)
      
      if (!user) {
        incrementUsage()
      }

      toast({
        title: "✓ Humanization complete",
        description: "Text made more natural",
        className: "bg-purple-50 text-purple-800 border-purple-200",
      })
    } catch (error: any) {
      console.error('Humanization error:', error)
      
      if (error.response?.status === 403 && error.response?.data?.message === 'GUEST_LIMIT_REACHED') {
        setShowLimitModal(true)
        toast({
          title: "Free Limit Reached",
          description: "You've used all 3 free checks. Please create an account to continue.",
          variant: "destructive",
        })
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to humanize. Please try again."
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      className: "bg-purple-50 text-purple-800 border-purple-200",
    })
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/guest" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Humanize Text</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Make AI text sound human</p>
              </div>
            </div>
            
            {!user && (
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                Free Access
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Card */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>AI-Generated Text</CardTitle>
                <CardDescription>Paste your AI-generated text here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste AI-generated text here to make it sound more human..."
                  className="min-h-[300px] resize-y"
                  disabled={isLoading}
                />
                
                <Button 
                  onClick={handleHumanize} 
                  disabled={isLoading || !inputText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Humanizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Humanize Text
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="border-gray-200 dark:border-gray-800 bg-purple-50/50 dark:bg-purple-900/10">
              <CardHeader>
                <CardTitle>Humanized Text</CardTitle>
                <CardDescription>Natural, human-like version</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Humanized text will appear here..."
                    className="min-h-[300px] resize-y bg-white dark:bg-gray-900"
                    disabled={isLoading}
                  />
                  {outputText && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="absolute top-2 right-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-semibold text-sm mb-2">What this does:</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Adds natural variations and imperfections</li>
                    <li>• Includes personal touches and emotions</li>
                    <li>• Varies sentence structure</li>
                    <li>• Makes text more engaging and relatable</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Info Section */}
          <div className="mt-8 p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
            <h3 className="font-semibold text-lg mb-2 text-pink-900 dark:text-pink-100">
              About Humanization
            </h3>
            <p className="text-sm text-pink-800 dark:text-pink-200">
              Our AI humanizer transforms robotic AI-generated text into natural, engaging content that sounds authentically human. Free for up to 3 uses! Create an account for unlimited humanization.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      
      <SignupLimitModal 
        open={showLimitModal || limitReached} 
        onOpenChange={setShowLimitModal}
        usageCount={3}
      />
    </div>
  )
}
