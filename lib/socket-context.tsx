"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: Map<string, boolean>
  typingUsers: Map<string, boolean>
  groupTypingUsers: Map<string, Set<string>>
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  groupTypingUsers: new Map(),
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const [groupTypingUsers, setGroupTypingUsers] = useState<Map<string, Set<string>>>(new Map())
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!user || !isAuthenticated) return

    // Initialize socket connection
    const socketInstance = io("http://localhost:5000", {
      auth: { userId: user._id },
      withCredentials: true,
    })

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
    })

    // Handle user status changes
    socketInstance.on("user_status_change", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev)
        newMap.set(userId, status === "online")
        return newMap
      })
    })

    // Handle typing indicators
    socketInstance.on("user_typing", ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev)
        newMap.set(userId, isTyping)
        return newMap
      })
    })

    // Handle group typing indicators
    socketInstance.on("user_group_typing", ({ groupId, userId, username, isTyping }) => {
      setGroupTypingUsers((prev) => {
        const newMap = new Map(prev)
        const typingSet = newMap.get(groupId) || new Set()

        if (isTyping) {
          typingSet.add(username)
        } else {
          typingSet.delete(username)
        }

        newMap.set(groupId, typingSet)
        return newMap
      })
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [user, isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, typingUsers, groupTypingUsers }}>
      {children}
    </SocketContext.Provider>
  )
}
