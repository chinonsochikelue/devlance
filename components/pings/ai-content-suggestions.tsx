"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AIContentSuggestionsProps = {
  onSelectIdea?: (idea: string) => void
}

export default function AIContentSuggestions({ onSelectIdea }: AIContentSuggestionsProps) {
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<string[]>([])
  const { toast } = useToast()

  const fetchContentIdeas = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/content-ideas`)

      if (!res.ok) throw new Error("Failed to fetch content ideas")

      const data = await res.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error("Error fetching content ideas:", error)
      toast({
        title: "Error",
        description: "Failed to fetch content ideas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContentIdeas()
  }, [])

  const handleSelectIdea = (idea: string) => {
    if (onSelectIdea) {
      onSelectIdea(idea)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">AI Content Ideas</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchContentIdeas} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>Personalized content suggestions based on your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ideas.length > 0 ? (
          <ul className="space-y-2">
            {ideas.map((idea, index) => (
              <li key={index}>
                <Button
                  variant="outline"
                  className="w-full flex items-start text-left h-auto py-2 font-normal whitespace-normal break-words"
                  onClick={() => handleSelectIdea(idea)}
                >
                  {idea}
                </Button>
              </li>
            ))}
          </ul>

        ) : (
          <p className="text-center text-muted-foreground py-8">No content ideas available</p>
        )}
      </CardContent>
    </Card>
  )
}
