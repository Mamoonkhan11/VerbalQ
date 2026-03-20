"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, ArrowLeft, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import { useAuth } from "@/lib/auth-context"
import { useGuestUsage } from "@/hooks/use-guest-usage"
import api from "@/lib/api"
import Link from "next/link"
import { SignupLimitModal } from "@/components/SignupLimitModal"

export default function GuestTranslationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { languages, loading: languagesLoading } = useLanguages()
  const { user } = useAuth()
  const { incrementUsage, limitReached, identifier } = useGuestUsage()
  const [isClient, setIsClient] = useState(false)
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard/translate")
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

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text to translate",
        className: "bg-white text-black border-gray-200",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use identifier from hook (guaranteed to exist after initialization)
      const guestIdentifier = identifier || 'unknown'

      const response = await api.post("/api/ai/translate", {
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      }, {
        headers: {
          'X-Device-Fingerprint': guestIdentifier
        }
      })
      const data = response.data

      if (!data.success) {
        throw new Error(data.message || "Translation failed")
      }

      setOutputText(data.data.translatedText || inputText)
      
      if (!user) {
        incrementUsage()
      }

      toast({
        title: "✓ Translation complete",
        description: "Text translated successfully",
        className: "bg-blue-50 text-blue-800 border-blue-200",
      })
    } catch (error: any) {
      console.error('Translation error:', error)
      
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
          description: error.message || "Failed to translate. Please try again.",
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
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/guest" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Translation</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Translate between 8+ languages</p>
              </div>
            </div>
            
            {!user && (
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
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
                <CardTitle>Source Text</CardTitle>
                <CardDescription>Enter text to translate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="min-h-[300px] resize-y"
                  disabled={isLoading}
                />
                
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="From language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle>Translated Text</CardTitle>
                <CardDescription>Translation result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Translation will appear here..."
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
                
                <div className="flex items-center justify-between">
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="To language" />
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
                    onClick={handleTranslate} 
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      "Translate"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Info Section */}
          <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-lg mb-2 text-purple-900 dark:text-purple-100">
              About Translation
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Our AI-powered translation supports 8+ languages including Spanish, French, German, Chinese, and more. Free for up to 3 uses without signup. Create an account for unlimited translations!
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
