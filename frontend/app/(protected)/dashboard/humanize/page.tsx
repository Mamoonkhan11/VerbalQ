"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

export default function HumanizePage() {
  const { toast } = useToast()
  const { languages } = useLanguages()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  // Helper function to count words
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleHumanize = async () => {
    const wordCount = countWords(inputText)

    if (!inputText.trim()) {
      toast({
        title: "❌ No Text Entered",
        description: "Please enter some text to humanize.",
        className: "border-red-200 bg-transparent text-red-800",
      })
      return
    }

    if (wordCount < 30) {
      toast({
        title: "❌ Text Too Short",
        description: `Text must be at least 30 words. Current: ${wordCount} words.`,
        className: "border-orange-200 bg-transparent text-orange-800",
      })
      return
    }

    if (wordCount > 120) {
      toast({
        title: "❌ Text Too Long",
        description: `Text must be maximum 120 words. Current: ${wordCount} words.`,
        className: "border-orange-200 bg-transparent text-orange-800",
      })
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await api.post("/api/ai/humanize", {
        text: inputText,
        language: selectedLanguage
      })
      const data = response.data

      setOutputText(data.data.humanizedText)

      toast({
        title: "✅ Text humanized",
        description: "Your text has been converted to natural, human-like writing.",
        className: "border-blue-200 bg-transparent text-blue-800",
      })
    } catch (err: any) {
      // Handle service unavailable
      if (err.response?.status === 503 && err.response?.data?.error === 'ML_SERVICE_UNAVAILABLE') {
        toast({
          title: "⚠️ AI service is currently unavailable",
          description: "Please try again later.",
          className: "border-red-200 bg-transparent text-red-800",
        })
        return
      }

      // Handle unsupported language
      if (err.response?.data?.error === 'LANGUAGE_NOT_SUPPORTED') {
        toast({
          title: "🚫 Language Not Supported",
          description: "The selected language is not supported for text humanization.",
          className: "border-orange-200 bg-transparent text-orange-800",
        })
        return
      }

      // Handle feature disabled
      if (err.response?.status === 403) {
        toast({
          title: "🚫 Feature Disabled",
          description: "This feature is currently disabled by the administrator.",
          className: "border-orange-200 bg-transparent text-orange-800",
        })
        return
      }

      // Handle other errors
      const errorMessage = err.response?.data?.message || "Failed to humanize text. Please try again."
      setError(errorMessage)
      toast({
        title: "❌ Humanization Failed",
        description: errorMessage,
        className: "border-red-200 bg-transparent text-red-800",
        })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Humanize AI Text</h1>
        <p className="text-muted-foreground">Convert AI-generated text into natural, human-like writing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">AI-Generated Text</CardTitle>
            <CardDescription>Paste your AI-generated text here (30-120 words)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label htmlFor="language-select" className="block text-sm font-medium text-foreground mb-2">
                    Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoading}>
                    <SelectTrigger id="language-select">
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
                </div>
              </div>

              <Textarea
                placeholder="Enter AI-generated text here (30-120 words)..."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  setError(null) // Clear any previous errors when user types
                }}
                className="min-h-64 resize-none"
                disabled={isLoading}
              />

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Word count: {countWords(inputText)}</span>
                <span className={`${countWords(inputText) < 30 || countWords(inputText) > 120 ? 'text-red-500' : 'text-green-500'}`}>
                  {countWords(inputText) < 30 ? 'Minimum 30 words required' :
                   countWords(inputText) > 120 ? 'Maximum 120 words allowed' :
                   'Word count is valid'}
                </span>
              </div>

              <Button onClick={handleHumanize} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Humanizing Text...
                  </>
                ) : (
                  "Humanize Text"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Humanized Text</CardTitle>
            <CardDescription>Your natural, human-like text will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea value={outputText} readOnly className="min-h-64 resize-none bg-muted" />

              {outputText && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      navigator.clipboard.writeText(outputText)
                    }}
                  >
                    Copy Text
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
