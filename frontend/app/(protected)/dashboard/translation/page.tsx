"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

export default function TranslationPage() {
  const { toast } = useToast()
  const { languages } = useLanguages()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await api.post("/api/ai/translate", {
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      })
      const data = response.data

      setOutputText(data.data.translatedText)

      const targetLangName = languages.find(lang => lang.code === targetLang)?.name || targetLang
      toast({
        title: "✅ Translation completed",
        description: `Translated to ${targetLangName}`,
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
          description: "One or both of the selected languages are not supported for translation.",
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
      const errorMessage = err.response?.data?.message || "Failed to translate text. Please try again."
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Language Translation</h1>
        <p className="text-muted-foreground">Translate text between multiple languages</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Original Text</CardTitle>
            <CardDescription>Enter English text to translate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label htmlFor="source-lang" className="block text-sm font-medium text-foreground mb-2">
                    From
                  </label>
                  <Select value={sourceLang} onValueChange={setSourceLang} disabled={isLoading}>
                    <SelectTrigger id="source-lang">
                      <SelectValue placeholder="Select source language" />
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

                <div className="flex items-center justify-center pt-6">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex-1">
                  <label htmlFor="target-lang" className="block text-sm font-medium text-foreground mb-2">
                    To
                  </label>
                  <Select value={targetLang} onValueChange={setTargetLang} disabled={isLoading}>
                    <SelectTrigger id="target-lang">
                      <SelectValue placeholder="Select target language" />
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
                placeholder={`Enter ${languages.find(lang => lang.code === sourceLang)?.name || 'text'} to translate...`}
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

              <Button onClick={handleTranslate} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Translated Text</CardTitle>
            <CardDescription>Your translated text will appear here</CardDescription>
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
                    Copy Translation
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
