"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

interface GrammarIssue {
  start: number
  end: number
  message: string
  suggestion: string
}

export default function GrammarPage() {
  const { toast } = useToast()
  const { languages } = useLanguages()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [issues, setIssues] = useState<GrammarIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to check")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await api.post("/api/ai/grammar", {
        text: inputText,
        language: selectedLanguage
      })
      const data = response.data

      setOutputText(data.data.correctedText)
      setIssues(data.data.issues || [])

      toast({
        title: "✅ Grammar check completed",
        description: `Found ${data.data.issues?.length || 0} issues`,
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
          description: "The selected language is not supported for grammar checking.",
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
      const errorMessage = err.response?.data?.message || "Failed to check grammar. Please try again."
      setError(errorMessage)
      toast({
        title: "❌ Error",
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Grammar & Writing Check</h1>
        <p className="text-muted-foreground">Enhance your writing by detecting and correcting grammar issues</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Input Text</CardTitle>
            <CardDescription>Paste or type your text here</CardDescription>
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
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-64 resize-none"
                disabled={isLoading}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCheck} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Grammar...
                  </>
                ) : (
                  "Check Grammar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Corrected Text</CardTitle>
            <CardDescription>Your improved text will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative transition-opacity duration-300">
              <Textarea value={outputText} readOnly className="min-h-64 resize-none bg-muted" />
                {outputText && (
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(outputText)
                        toast({ title: "Copied", description: "Corrected text copied to clipboard", className: "border-blue-200 bg-transparent text-blue-800" })
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Issues Found: {issues.length}</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {issues.map((issue, idx) => (
                      <div key={idx} className="text-sm bg-destructive/10 border border-destructive/20 rounded-md p-2">
                        <p className="font-medium text-destructive mb-1">{issue.message}</p>
                        <p className="text-muted-foreground">Suggestion: {issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outputText && issues.length === 0 && (
                <div className="text-center py-6">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    No grammar issues found
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
