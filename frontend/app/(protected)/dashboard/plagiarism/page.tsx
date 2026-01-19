"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguages } from "@/hooks/use-languages"
import api from "@/lib/api"

interface Match {
  text: string
  source: string
  similarity: number
}

export default function PlagiarismPage() {
  const { toast } = useToast()
  const { languages } = useLanguages()
  const [inputText, setInputText] = useState("")
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
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
      const response = await api.post("/api/ai/plagiarism", {
        text: inputText,
        language: selectedLanguage
      })
      const data = response.data

      setPlagiarismScore(data.data.plagiarismScore)
      setMatches(data.data.matches || [])

      toast({
        title: "✅ Plagiarism check completed",
        description: `Analysis found ${data.data.plagiarismScore}% similarity`,
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
          description: "The selected language is not supported for plagiarism checking.",
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
      const errorMessage = err.response?.data?.message || "Failed to check plagiarism. Please try again."
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

  const getScoreColor = (score: number) => {
    if (score < 10) return "text-green-600"
    if (score < 25) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score < 10) return "outline"
    if (score < 25) return "secondary"
    return "destructive"
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Plagiarism Checker</h1>
        <p className="text-muted-foreground">Analyze text similarity and identify potential plagiarism</p>
      </div>

      {/* Input Section */}
      <Card className="border border-border mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Text Input</CardTitle>
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
                  Checking Plagiarism...
                </>
              ) : (
                "Check Plagiarism"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {plagiarismScore !== null && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Plagiarism Score</CardTitle>
              <CardDescription>Percentage of text with detected similarities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold" style={{ color: getScoreColor(plagiarismScore).split("-")[1] }}>
                    {plagiarismScore}%
                  </span>
                  <Badge variant={getScoreBadgeVariant(plagiarismScore)}>
                    {plagiarismScore < 10 ? "Original" : plagiarismScore < 25 ? "Minor" : "High"}
                  </Badge>
                </div>
                <Progress value={plagiarismScore} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {plagiarismScore < 10
                    ? "Your text appears to be original."
                    : plagiarismScore < 25
                      ? "Low plagiarism detected. Review the matches below."
                      : "High plagiarism detected. Review the matches below."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Matches */}
          {matches.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Detected Matches ({matches.length})</CardTitle>
                <CardDescription>Sentences with potential similarities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matches.map((match, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-foreground flex-1">{match.text}</p>
                        <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                          {match.similarity}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Source: {match.source}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
