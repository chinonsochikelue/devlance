"use client"

import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, Sparkles, Check } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

type AIContentEnhancerProps = {
    text: string
    onEnhanced?: (enhancedText: string) => void
}

export default function AIContentEnhancer({ text, onEnhanced }: AIContentEnhancerProps) {
    const [loading, setLoading] = useState(false)
    const [enhancedText, setEnhancedText] = useState<string | null>(null)
    const { toast } = useToast()
    console.log(text)

    const enhanceContent = async () => {
        if (!text.trim()) return

        setLoading(true)
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/enhance-content`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            })

            if (!res.ok) throw new Error("Failed to enhance content")

            const data = await res.json()
            setEnhancedText(data.enhanced)
        } catch (error) {
            console.error("Error enhancing content:", error)
            toast({
                title: "Error",
                description: "Failed to enhance content",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const applyEnhancement = () => {
        if (enhancedText && onEnhanced) {
            onEnhanced(enhancedText)
            setEnhancedText(null)
        }
    }

    return (
        <div className="mt-4">
            {!enhancedText ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={enhanceContent}
                    disabled={loading || !text.trim()}
                    className="flex items-center"
                >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Enhance with AI
                </Button>
            ) : (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Enhanced Content</CardTitle>
                        <CardDescription>AI-improved version of your post</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{enhancedText}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEnhancedText(null)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={applyEnhancement} className="flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            Apply
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
