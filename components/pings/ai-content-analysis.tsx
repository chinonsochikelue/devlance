"use client"

import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

type AIContentAnalysisProps = {
  text: string
  onAnalysisComplete?: (analysis: any) => void
}

export default function AIContentAnalysis({ text, onAnalysisComplete }: AIContentAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [expanded, setExpanded] = useState(false)
  const {toast}=useToast()

  const analyzeContent = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/analyze-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error("Failed to analyze content")

      const data = await res.json()
      setAnalysis(data)

      if (onAnalysisComplete) {
        onAnalysisComplete(data)
      }
    } catch (error) {
      console.error("Error analyzing content:", error)
      toast({
        title: "Error",
        description: "Failed to analyze content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 mr-2" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 mr-2" />
      default:
        return <AlertTriangle className="h-4 w-4 mr-2" />
    }
  }

  const getScorePercentage = (score: number) => {
    // Convert score from -1 to 1 range to 0-100 percentage
    return ((score + 1) / 2) * 100
  }

  return (
    <div className="mt-4">
      {!analysis ? (
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeContent}
          disabled={loading || !text.trim()}
          className="flex items-center"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Analyze with AI
        </Button>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Content Analysis</CardTitle>
              <Badge className={`${getSentimentColor(analysis.sentiment)} text-white`}>
                {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
              </Badge>
            </div>
            <CardDescription>Sentiment analysis powered by Google Gemini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Sentiment Score</span>
                  <span className="text-sm font-medium">{analysis.score.toFixed(2)}</span>
                </div>
                <Progress value={getScorePercentage(analysis.score)} className="h-2" />
              </div>

              <div>
                <div className="flex items-center text-sm font-medium mb-1">
                  {getSentimentIcon(analysis.sentiment)}
                  Summary
                </div>
                <p className="text-sm text-muted-foreground">
                  {expanded
                    ? analysis.summary
                    : `${analysis.summary.substring(0, 100)}${analysis.summary.length > 100 ? "..." : ""}`}
                </p>
                {analysis.summary.length > 100 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
