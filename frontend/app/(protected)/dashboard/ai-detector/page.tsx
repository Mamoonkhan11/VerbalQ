"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface AIDetectionResult {
  aiProbability: number
  humanProbability: number
  label: string
  confidence: string
}

export default function AIDetectorPage() {
  const { toast } = useToast()
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<AIDetectionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDetect = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please paste text first",
        description: "Enter some text to analyze for AI generation",
        className: "bg-white text-black border-gray-200",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await api.post("/api/ai/ai-detect", {
        text: inputText
      })
      const data = response.data

      setResult({
        aiProbability: data.data.aiProbability,
        humanProbability: data.data.humanProbability,
        label: data.data.label,
        confidence: data.data.confidence
      })

      toast({
        title: "AI detection completed",
        description: `Analysis shows ${data.data.aiProbability}% AI probability`,
        className: "bg-white text-black border-gray-200",
      })
    } catch (err: any) {
      // Handle LLM unavailable
      if (err.response?.status === 503 && err.response?.data?.error === 'LLM_UNAVAILABLE') {
        toast({
          title: "AI detection service unavailable",
          description: "Please ensure Ollama is running with mistral model.",
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
      const errorMessage = err.response?.data?.message || "Failed to detect AI text. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-white text-black border-gray-200",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getLabelColor = (label: string) => {
    return label === "AI" ? "text-red-600" : "text-green-600"
  }

  const getConfidenceColor = (confidence: string) => {
    if (confidence === "High") return "text-red-600"
    if (confidence === "Medium") return "text-yellow-600"
    return "text-gray-600"
  }

  const getProgressColor = (probability: number) => {
    return probability > 50 ? "bg-red-500" : "bg-green-500"
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Text Detector</h1>
        <p className="text-muted-foreground">Detect if text is AI-generated or human-written using advanced style analysis</p>
      </div>

      {/* Input Section */}
      <Card className="border border-border mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Text Input</CardTitle>
          <CardDescription>Paste text to analyze for AI generation indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste text to analyze for AI generation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-64 resize-none"
              disabled={isLoading}
            />

            <Button onClick={handleDetect} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting AI Content...
                </>
              ) : (
                "Detect AI Content"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Detection Results</CardTitle>
            <CardDescription>AI vs Human text classification analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Probability Bars */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-600">AI Probability</span>
                  <span className="text-lg font-bold text-red-600">{result.aiProbability}%</span>
                </div>
                <Progress value={result.aiProbability} className="h-3 bg-red-100 [&_[role=progressbar]]:bg-red-500" />
                
                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium text-green-600">Human Probability</span>
                  <span className="text-lg font-bold text-green-600">{result.humanProbability}%</span>
                </div>
                <Progress value={result.humanProbability} className="h-3 bg-green-100 [&_[role=progressbar]]:bg-green-500" />
              </div>

              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">Classification</h3>
                  <Badge 
                    className={`${result.label === "AI" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} text-lg px-4 py-2`}
                  >
                    {result.label === "AI" ? "AI Generated" : "Human Written"}
                  </Badge>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">Confidence</h3>
                  <Badge 
                    className={`${result.confidence === "High" ? "bg-red-100 text-red-800" : 
                                result.confidence === "Medium" ? "bg-yellow-100 text-yellow-800" : 
                                "bg-gray-100 text-gray-800"} text-lg px-4 py-2`}
                  >
                    {result.confidence}
                  </Badge>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">Analysis Summary</h3>
                <p className="text-sm">
                  The text shows <span className={getLabelColor(result.label)}>{result.label.toLowerCase()}</span> writing patterns with 
                  <span className={getConfidenceColor(result.confidence)}> {result.confidence.toLowerCase()}</span> confidence. 
                  AI probability: <span className="text-red-600 font-medium">{result.aiProbability}%</span>, 
                  Human probability: <span className="text-green-600 font-medium">{result.humanProbability}%</span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}