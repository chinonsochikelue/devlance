"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Search, Send } from "lucide-react"
import VerificationBadge from "@/components/verification-badge"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { debounce } from "lodash"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/lib/socket-context"
import OnlineStatus from "@/components/message/online-status"
import TypingIndicator from "@/components/message/typing-indicator"

type Conversation = {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    profilePic?: string
    verified?: boolean
  }
  lastMessage: {
    text: string
    createdAt: string
    read: boolean
  }
  unreadCount: number
  updatedAt: string
  userStatus?: {
    status: "online" | "offline"
    lastActive?: string
  }
}

type Message = {
  _id: string
  text: string
  sender: {
    _id: string
    name: string
    username: string
    profilePic?: string
    verified?: boolean
  }
  recipient: string
  createdAt: string
  read: boolean
}

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<Conversation["user"] | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Debounced typing indicator
  const debouncedTypingIndicator = useRef(
    debounce((isTyping: boolean) => {
      if (socket && selectedUser) {
        socket.emit("typing", {
          recipientId: selectedUser._id,
          isTyping,
        })
      }
    }, 500),
  ).current

  useEffect(() => {
  if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchConversations = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversations`)
        if (!res.ok) throw new Error("Failed to fetch conversations")

        const data = await res.json()
        setConversations(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchConversations()

    // Set up socket event listeners
    if (socket) {
      // Listen for new private messages
      socket.on("private_message", (message) => {
        // Add message to current conversation if it's open
        if (selectedUser && message.sender._id === selectedUser._id) {
          setMessages((prev) => [...prev, message])

          // Mark message as read
          socket.emit("mark_read", {
            conversationId: selectedConversation,
            messageIds: [message._id],
          })
        }

        // Update conversations list
        updateConversationWithNewMessage(message)
      })

      // Listen for message sent confirmation
      socket.on("message_sent", (message) => {
        // Update messages list with the confirmed message
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((m) => m._id === message._id)
          if (exists) return prev
          return [...prev, message]
        })
      })

      // Listen for conversation updates
      socket.on("update_conversations", () => {
        fetchConversations()
      })

      // Listen for message errors
      socket.on("message_error", ({ error }) => {
        toast({
          title: "Error",
          description: error || "Failed to send message",
          variant: "destructive",
        })
        setSendingMessage(false)
      })

      // Listen for read receipts
      socket.on("messages_read", ({ conversationId, messageIds }) => {
        // Update read status of messages
        setMessages((prev) =>
          prev.map((message) => (messageIds.includes(message._id) ? { ...message, read: true } : message)),
        )
      })
    }

    return () => {
      if (socket) {
        socket.off("private_message")
        socket.off("message_sent")
        socket.off("update_conversations")
        socket.off("message_error")
        socket.off("messages_read")
      }
    }
  }, [user, router, socket, selectedUser, selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations((prev) => {
      const updatedConversations = [...prev]
      const existingConvIndex = updatedConversations.findIndex(
        (conv) => conv.user._id === message.sender._id || conv.user._id === message.recipient,
      )

      const otherUserId = message.sender._id === user?._id ? message.recipient : message.sender._id

      if (existingConvIndex !== -1) {
        // Update existing conversation
        const isSelected = selectedUser && selectedUser._id === otherUserId

        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: {
            text: message.text,
            createdAt: message.createdAt,
            read: isSelected || message.sender._id === user?._id,
          },
          unreadCount: isSelected
            ? 0
            : message.sender._id === user?._id
              ? updatedConversations[existingConvIndex].unreadCount
              : updatedConversations[existingConvIndex].unreadCount + 1,
          updatedAt: message.createdAt,
        }

        // Move this conversation to the top
        const [conv] = updatedConversations.splice(existingConvIndex, 1)
        updatedConversations.unshift(conv)
      } else {
        // Create new conversation entry
        const otherUser =
          message.sender._id === user?._id
            ? { _id: message.recipient } // We only have the ID for the recipient
            : message.sender // We have full sender info

        updatedConversations.unshift({
          _id: Date.now().toString(), // Temporary ID until refresh
          user: otherUser,
          lastMessage: {
            text: message.text,
            createdAt: message.createdAt,
            read: false,
          },
          unreadCount: message.sender._id === user?._id ? 0 : 1,
          updatedAt: message.createdAt,
        })
      }

      return updatedConversations
    })
  }

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetchWithAuth(`/api/messages/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch messages")

      const data = await res.json()
      setMessages(data.messages)

      // Update unread count in the conversation list
      setConversations((prev) => prev.map((conv) => (conv.user._id === userId ? { ...conv, unreadCount: 0 } : conv)))
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation._id)
    setSelectedUser(conversation.user)
    fetchMessages(conversation.user._id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser || !newMessage.trim()) return

    setSendingMessage(true)

    try {
      if (socket && isConnected) {
        // Send via socket for real-time delivery
        socket.emit("private_message", {
          recipientId: selectedUser._id,
          text: newMessage,
        })

        // Clear the input immediately for better UX
        setNewMessage("")

        // Stop typing indicator
        debouncedTypingIndicator(false)
      } else {
        // Fallback to REST API if socket is not connected
        const res = await fetchWithAuth("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: selectedUser._id,
            text: newMessage,
          }),
        })

        if (!res.ok) throw new Error("Failed to send message")

        const data = await res.json()

        // Add the new message to the messages list
        setMessages((prev) => [...prev, data])

        // Update the conversation list
        updateConversationWithNewMessage(data)

        // Clear the input
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    // Send typing indicator
    if (selectedUser && socket) {
      debouncedTypingIndicator(e.target.value.length > 0)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Conversations sidebar */}
      <div className="w-full border-r md:w-80">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation === conversation._id ? "bg-muted" : ""
                      }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conversation.user.profilePic || "/placeholder.svg"}
                            alt={conversation.user.name}
                          />
                          <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                        </Avatar>
                        <OnlineStatus userId={conversation.user._id} className="absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="font-medium truncate">{conversation.user.name}</span>
                            {conversation.user.verified && <VerificationBadge size="sm" />}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage?.text}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="rounded-full px-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a conversation by visiting a user&apos;s profile
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Link href={`/profile/${selectedUser._id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedUser.profilePic || "/placeholder.svg"} alt={selectedUser.name} />
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <OnlineStatus userId={selectedUser._id} className="absolute -bottom-0.5 -right-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Link href={`/profile/${selectedUser._id}`} className="font-medium hover:underline">
                      {selectedUser.name}
                    </Link>
                    {selectedUser.verified && <VerificationBadge size="sm" />}
                  </div>
                  <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/profile/${selectedUser._id}`}>View Profile</Link>
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isOwnMessage = message.sender._id === user?._id

                  return (
                    <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className="flex items-start gap-2 max-w-[70%]">
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={message.sender.profilePic || "/placeholder.svg"}
                              alt={message.sender.name}
                            />
                            <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`rounded-lg p-3 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{formatMessageTime(message.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            <div className="px-4">
              <TypingIndicator userId={selectedUser._id} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleInputChange}
                  disabled={sendingMessage}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium">Select a conversation</h2>
              <p className="text-muted-foreground mt-1">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
