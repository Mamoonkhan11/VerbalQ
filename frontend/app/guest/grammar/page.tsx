"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import { useAuth } from "@/lib/auth-context"
import { useGuestUsage } from "@/hooks/use-guest-usage"
import api from "@/lib/api"
import Link from "next/link"
import { SignupLimitModal } from "@/components/SignupLimitModal"

interface GrammarCorrection {
  incorrect: string
  correction: string
  explanation: string
}

export default function GuestGrammarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { languages, loading: languagesLoading } = useLanguages()
  const { user } = useAuth()
  const { incrementUsage, limitReached, identifier } = useGuestUsage()
  const [isClient, setIsClient] = useState(false)
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [corrections, setCorrections] = useState<GrammarCorrection[]>([])
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard/grammar")
    }
  }, [user, router])

  // Listen for guest limit reached event
  useEffect(() => {
    const handleLimitReached = () => {
      setShowLimitModal(true)
    }

    window.addEventListener('guest-limit-reached', handleLimitReached)
    return () => window.removeEventListener('guest-limit-reached', handleLimitReached)
  }, [])

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to check",
        className: "bg-white text-black border-gray-200",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use identifier from hook (guaranteed to exist after initialization)
      const guestIdentifier = identifier || 'unknown'

      const response = await api.post("/api/ai/grammar", {
        text: inputText,
        language: selectedLanguage
      }, {
        headers: {
          'X-Device-Fingerprint': guestIdentifier
        }
      })
      
      const data = response.data

      if (!data.success) {
        throw new Error(data.message || "Grammar check failed")
      }

      const newCorrections = data.data.corrections || []
      setOutputText(data.data.correctedText || inputText)
      setCorrections(newCorrections)
      
      // Track usage for guest users (only after successful completion)
      if (!user) {
        incrementUsage()
      }

      toast({
        title: "✓ Grammar check complete",
        description: `${newCorrections.length} issues found`,
        className: "bg-green-50 text-green-800 border-green-200",
      })
    } catch (error: any) {
      console.error('Grammar check error:', error)
      
      // Check if it's a guest limit error
      if (error.response?.status === 403 && error.response?.data?.message === 'GUEST_LIMIT_REACHED') {
        setShowLimitModal(true)
        toast({
          title: "Free Limit Reached",
          description: "You've used all 3 free checks. Please create an account to continue.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to check grammar. Please try again.",
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
      className: "bg-blue-50 text-blue-800 border-blue-200",
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
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/guest" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grammar Checker</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered grammar correction</p>
              </div>
            </div>
            
            {!user && (
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
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
                <CardTitle>Original Text</CardTitle>
                <CardDescription>Enter or paste your text here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="min-h-[300px] resize-y"
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleCheck} 
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Grammar"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="border-gray-200 dark:border-gray-800 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle>Corrected Text</CardTitle>
                <CardDescription>AI-corrected version of your text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Corrected text will appear here..."
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
                
                {corrections.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Corrections Made:</h4>
                    {corrections.slice(0, 5).map((correction, index) => (
                      <div key={index} className="text-sm p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                        <p className="text-red-600 line-through">{correction.incorrect}</p>
                        <p className="text-green-600 font-medium">{correction.correction}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{correction.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">
              About This Tool
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Our AI-powered grammar checker helps you write clearly and effectively by identifying grammar errors, punctuation mistakes, and style issues. This free tool allows up to 3 uses without signup. Create a free account for unlimited access!
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
