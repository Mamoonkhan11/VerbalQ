"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight, Languages } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages, useTranslationLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

export default function TranslationPage() {
  const { toast } = useToast()
  const { languages } = useLanguages()
  const { supportedPairs } = useTranslationLanguages()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available target languages based on selected source language
  const availableTargets = supportedPairs
    .filter(pair => pair.from === sourceLang)
    .map(pair => pair.to)

  // Reset target language if not available for new source language
  useEffect(() => {
    if (availableTargets.length > 0 && !availableTargets.includes(targetLang)) {
      setTargetLang(availableTargets[0])
    }
  }, [sourceLang, availableTargets, targetLang])

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

      if (data.success) {
        setOutputText(data.data.translatedText)
        
        const targetLangName = languages.find(lang => lang.code === targetLang)?.name || targetLang
        toast({
          title: " Translation completed",
          description: `Translated to ${targetLangName}`,
          className: "border-blue-200 bg-transparent text-blue-800",
        })
      }
    } catch (err: any) {
      const errorData = err.response?.data
      
      // Handle explicit error codes from backend
      if (errorData?.error === 'TRANSLATION_NOT_SUPPORTED') {
        toast({
          variant: "destructive",
          title: " Not Supported",
          description: "This language pair is not currently supported.",
        })
        return
      }

      if (err.response?.status === 503) {
        toast({
          variant: "destructive",
          title: " Service Unavailable",
          description: "The AI translation service is currently offline.",
        })
        return
      }

      const errorMessage = errorData?.message || "Failed to translate. Please try again."
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: " Error",
        description: errorMessage,
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
                      {languages
                        .filter(lang => availableTargets.includes(lang.code))
                        .map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      {availableTargets.length === 0 && (
                        <SelectItem value="none" disabled>No target languages available</SelectItem>
                      )}
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

              <Button 
                onClick={handleTranslate} 
                disabled={isLoading || !inputText.trim() || availableTargets.length === 0} 
                className="w-full"
              >
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
