"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

export default function GrammarPage() {
  const { toast } = useToast()
  const { languages, loading: languagesLoading } = useLanguages()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

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
      const response = await api.post("/api/ai/grammar", {
        text: inputText,
        language: selectedLanguage
      })
      const data = response.data

      setOutputText(data.data.correctedText)

      // Show method badge in toast
      const method = data.data.method || 'AI'
      toast({
        title: "Grammar check completed",
        description: `Corrected using ${method.toUpperCase()}`,
        className: "bg-white text-black border-gray-200",
      })
    } catch (err: any) {
      // Handle LLM unavailable
      if (err.response?.status === 503 && err.response?.data?.error === 'LLM_UNAVAILABLE') {
        toast({
          title: "LLM service unavailable",
          description: "Please ensure Ollama is running with llama3 or mistral model.",
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      // Handle ML service unavailable
      if (err.response?.status === 503) {
        toast({
          title: "AI service unavailable",
          description: "Please try again later.",
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      // Handle feature disabled
      if (err.response?.status === 403) {
        toast({
          title: "Feature disabled",
          description: "This feature is currently disabled by the administrator.",
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      // Handle other errors
      const errorMessage = err.response?.data?.message || "Failed to check grammar. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-white text-black border-gray-200",
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

              <Button onClick={handleCheck} disabled={isLoading || languagesLoading} className="w-full">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
