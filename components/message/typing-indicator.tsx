"use client"

import { useSocket } from "@/lib/socket-context"
import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  userId: string
  className?: string
}

export default function TypingIndicator({ userId, className }: TypingIndicatorProps) {
  const { typingUsers } = useSocket()
  const isTyping = typingUsers.get(userId)

  if (!isTyping) return null

  return (
    <div className={cn("text-xs text-muted-foreground animate-pulse", className)}>
      <span>typing</span>
      <span className="dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
      <style jsx>{`
        .dots {
          display: inline-block;
        }
        .dot {
          animation: wave 1.3s linear infinite;
          display: inline-block;
        }
        .dot:nth-child(2) {
          animation-delay: -1.1s;
        }
        .dot:nth-child(3) {
          animation-delay: -0.9s;
        }
        @keyframes wave {
          0%, 60%, 100% {
            transform: initial;
          }
          30% {
            transform: translateY(-0.2em);
          }
        }
      `}</style>
    </div>
  )
}
