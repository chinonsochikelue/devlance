"use client"

import { useSocket } from "@/lib/socket-context"
import { cn } from "@/lib/utils"

interface OnlineStatusProps {
  userId: string
  className?: string
}

export default function OnlineStatus({ userId, className }: OnlineStatusProps) {
  const { onlineUsers } = useSocket()
  const isOnline = onlineUsers.get(userId)

  return (
    <div
      className={cn(
        "h-2.5 w-2.5 rounded-full border-2 border-white",
        isOnline ? "bg-green-500" : "bg-gray-300",
        className,
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  )
}
