"use client"

import { useSocket } from "@/lib/socket-context"
import { cn } from "@/lib/utils"

interface GroupTypingIndicatorProps {
  groupId: string
  className?: string
}

export default function GroupTypingIndicator({ groupId, className }: GroupTypingIndicatorProps) {
  const { groupTypingUsers } = useSocket()
  const typingUsers = groupTypingUsers.get(groupId) || new Set()

  if (typingUsers.size === 0) return null

  let typingText = ""
  if (typingUsers.size === 1) {
    typingText = `${Array.from(typingUsers)[0]} is typing`
  } else if (typingUsers.size === 2) {
    const users = Array.from(typingUsers)
    typingText = `${users[0]} and ${users[1]} are typing`
  } else {
    typingText = `${typingUsers.size} people are typing`
  }

  return (
    <div className={cn("text-xs text-muted-foreground animate-pulse", className)}>
      <span>{typingText}</span>
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
