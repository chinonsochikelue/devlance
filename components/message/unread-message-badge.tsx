"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function UnreadMessageBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/unread`)
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    fetchUnreadCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (unreadCount === 0) return null

  return (
    <Badge
      variant="destructive"
      className="absolute top-4 right-2 translate-x-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {unreadCount > 9 ? "9+" : unreadCount
      }
    </Badge >

  )
}
