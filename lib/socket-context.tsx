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
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Map(),
  typingUsers: new Map(),
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const { user, token } = useAuth()

  useEffect(() => {
    if (!user || !token) return

    // Initialize socket connection
    const socketInstance = io("http://localhost:5000", {
      auth: { token },
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

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [user, token])

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, typingUsers }}>
      {children}
    </SocketContext.Provider>
  )
}
