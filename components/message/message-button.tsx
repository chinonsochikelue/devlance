"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MessageButtonProps {
  userId: string
  username: string
}

export default function MessageButton({ userId, username }: MessageButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleClick = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user._id === userId) {
      toast({
        title: "Error",
        description: "You cannot message yourself",
        variant: "destructive",
      })
      return
    }

    try {
      // Create an empty conversation if one doesn't exist
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: userId,
          text: `Hello ${username}! I'd like to connect with you.`,
        }),
      })

      // Navigate to messages page
      router.push("/messages")
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleClick} className="w-full">
      <MessageSquare className="mr-2 h-4 w-4" />
      Message
    </Button>
  )
}
