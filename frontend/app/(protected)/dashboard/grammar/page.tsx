"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import { useFormDataRetention } from "@/hooks/use-form-data-retention"
import api from "@/lib/api"

interface GrammarCorrection {
  incorrect: string
  correction: string
  explanation: string
}

interface GrammarFormData {
  inputText: string
  selectedLanguage: string
  outputText?: string
  corrections?: GrammarCorrection[]
}

export default function GrammarPage() {
  const { toast } = useToast()
  const { languages, loading: languagesLoading } = useLanguages()
  const { saveFormData, getFormData } = useFormDataRetention()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [corrections, setCorrections] = useState<GrammarCorrection[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Restore form data if available
  useEffect(() => {
    if (isClient) {
      const savedData = getFormData('grammar') as GrammarFormData | null
      if (savedData) {
        setInputText(savedData.inputText)
        setSelectedLanguage(savedData.selectedLanguage)
      }
    }
  }, [isClient])

  // Save form data when input or language changes
  useEffect(() => {
    if (inputText || selectedLanguage !== 'en') {
      saveFormData('grammar', {
        inputText,
        selectedLanguage,
      })
    }
  }, [inputText, selectedLanguage])

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

      if (!data.success) {
        throw new Error(data.message || "Grammar check failed")
      }

      setOutputText(data.data.correctedText || "")
      setCorrections(data.data.corrections || [])

      // Save result to form data
      saveFormData('grammar', {
        inputText,
        selectedLanguage,
        outputText: data.data.correctedText,
        corrections: data.data.corrections,
      })

      toast({
        title: "Grammar check completed",
        description: "Your text has been checked for grammar issues.",
        className: "bg-white text-black border-gray-200",
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to check grammar. Please try again."
      // Handle LLM unavailable
      if (err.response?.status === 503 && err.response?.data?.error === 'LLM_UNAVAILABLE') {
        toast({
          title: "LLM service unavailable",
          description: "Please ensure Ollama is running with mistral model.",
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      // Handle ML service unavailable
      if (err.response?.status === 503) {
        toast({
          title: "Grammar service unavailable",
          description: errorMessage,
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      if (err.response?.status === 403 && errorMessage === "This feature is currently disabled by admin") {
        toast({
          title: "Feature disabled",
          description: "This feature is currently disabled by the administrator.",
          className: "bg-white text-black border-gray-200",
        })
        return
      }

      // Handle other errors
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
            <CardTitle className="text-lg">Results</CardTitle>
            <CardDescription>See corrected text and suggested corrections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Corrected text with copy button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Corrected</p>
                  {outputText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(outputText)
                        toast({
                          title: "Copied",
                          description: "Corrected text copied to clipboard",
                          className: "border-blue-200 bg-transparent text-blue-800",
                        })
                      }}
                      className="gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  )}
                </div>
                <div className="rounded-md border border-border bg-muted p-3 text-sm transition-all duration-300">
                  {outputText ? (
                    <p className="whitespace-pre-wrap break-words">{outputText}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">Corrected version will appear here after you run a check.</p>
                  )}
                </div>
              </div>

              {/* Corrections list */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Corrections</p>
                {corrections.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {outputText
                      ? "No specific issues were highlighted. Your text may already be grammatically correct."
                      : "Run a grammar check to see detailed corrections here."}
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm transition-all duration-300">
                    {corrections.map((c, idx) => (
                      <li
                        key={`${c.incorrect}-${idx}`}
                        className="rounded-md border border-border bg-muted/60 p-2"
                      >
                        <div className="flex flex-wrap items-center gap-1 text-sm">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Replace</span>
                          <span className="bg-red-200 text-red-700 font-semibold rounded px-1">
                            {c.incorrect}
                          </span>
                          <span className="text-xs text-muted-foreground mx-1">with</span>
                          <span className="bg-green-200 text-green-700 font-semibold rounded px-1">
                            {c.correction}
                          </span>
                        </div>
                        {c.explanation && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reason: {c.explanation}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
