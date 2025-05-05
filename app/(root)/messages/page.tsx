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
import { Loader2, Search, Send, Plus, Users, Settings, MoreVertical, Paperclip, Smile } from "lucide-react"
import VerificationBadge from "@/components/verification-badge"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSocket } from "@/lib/socket-context"
import { debounce } from "lodash"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import OnlineStatus from "@/components/message/online-status"
import TypingIndicator from "@/components/message/typing-indicator"
import EmojiPicker from "@/components/ui/emoji-picker"

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
  isGroup?: boolean
  groupMembers?: Array<{
    _id: string
    name: string
    username: string
    profilePic?: string
  }>
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
  attachments?: Array<{
    type: string
    url: string
  }>
}

type GroupChat = {
  _id: string
  name: string
  description?: string
  members: Array<{
    _id: string
    name: string
    username: string
    profilePic?: string
  }>
  createdBy: string
  createdAt: string
  updatedAt: string
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
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct")
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { toast } = useToast()
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [selectedGroupChat, setSelectedGroupChat] = useState<GroupChat | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!user) {
      router.push("/login")
      return
    }

    const fetchConversations = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversations`)
        if (!res.ok) throw new Error("Failed to fetch conversations")

        const data = await res.json()
        setConversations(data.filter((conv) => !conv.isGroup))
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

    const fetchGroupChats = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups`)
        if (!res.ok) throw new Error("Failed to fetch group chats")

        const data = await res.json()
        setGroupChats(data)
      } catch (error) {
        console.error("Error fetching group chats:", error)
      }
    }

    fetchConversations()
    fetchGroupChats()

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

      // Listen for group messages
      socket.on("group_message", (message) => {
        if (selectedGroupChat && message.groupId === selectedGroupChat._id) {
          setMessages((prev) => [...prev, message])
        }

        // Update group chats list
        updateGroupWithNewMessage(message)
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

      // Listen for group updates
      socket.on("update_groups", () => {
        fetchGroupChats()
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
        socket.off("group_message")
        socket.off("message_sent")
        socket.off("update_conversations")
        socket.off("update_groups")
        socket.off("message_error")
        socket.off("messages_read")
      }
    }
  }, [user, router, socket, selectedUser, selectedConversation, selectedGroupChat])

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

  const updateGroupWithNewMessage = (message: any) => {
    setGroupChats((prev) => {
      return prev.map((group) => {
        if (group._id === message.groupId) {
          return {
            ...group,
            lastMessage: {
              text: message.text,
              sender: message.sender.name,
              createdAt: message.createdAt,
            },
          }
        }
        return group
      })
    })
  }

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/${userId}`)
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

  const fetchGroupMessages = async (groupId: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${groupId}`)
      if (!res.ok) throw new Error("Failed to fetch group messages")

      const data = await res.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Error fetching group messages:", error)
      toast({
        title: "Error",
        description: "Failed to load group messages",
        variant: "destructive",
      })
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation._id)
    setSelectedUser(conversation.user)
    setSelectedGroupChat(null)
    fetchMessages(conversation.user._id)
    setActiveTab("direct")
  }

  const handleSelectGroupChat = (group: GroupChat) => {
    setSelectedGroupChat(group)
    setSelectedUser(null)
    setSelectedConversation(null)
    fetchGroupMessages(group._id)
    setActiveTab("groups")
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!selectedUser && !selectedGroupChat) || !newMessage.trim()) return

    setSendingMessage(true)

    try {
      if (selectedUser) {
        // Send direct message
        if (socket && isConnected) {
          // Send via socket for real-time delivery
          socket.emit("private_message", {
            recipientId: selectedUser._id,
            text: newMessage,
            attachment: attachment
              ? {
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
              }
              : null,
          })

          // Clear the input immediately for better UX
          setNewMessage("")
          setAttachment(null)

          // Stop typing indicator
          debouncedTypingIndicator(false)
        } else {
          // Fallback to REST API if socket is not connected
          const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, {
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
          setAttachment(null)
        }
      } else if (selectedGroupChat) {
        // Send group message
        if (socket && isConnected) {
          socket.emit("group_message", {
            groupId: selectedGroupChat._id,
            text: newMessage,
            attachment: attachment
              ? {
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
              }
              : null,
          })

          setNewMessage("")
          setAttachment(null)
        } else {
          const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${selectedGroupChat._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: newMessage,
            }),
          })

          if (!res.ok) throw new Error("Failed to send group message")

          const data = await res.json()
          setMessages((prev) => [...prev, data])
          setNewMessage("")
          setAttachment(null)
        }
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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Group name and at least one member are required",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          members: selectedUsers,
        }),
      })

      if (!res.ok) throw new Error("Failed to create group")

      const newGroup = await res.json()
      setGroupChats((prev) => [newGroup, ...prev])
      setShowNewGroupDialog(false)
      setGroupName("")
      setGroupDescription("")
      setSelectedUsers([])

      toast({
        title: "Success",
        description: "Group chat created successfully",
      })

      // Select the new group
      handleSelectGroupChat(newGroup)
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      })
    }
  }

  const handleSearchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    setSearchingUsers(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/users?q=${query}`)
      if (!res.ok) throw new Error("Failed to search users")

      const data = await res.json()
      setSearchResults(data.users)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setSearchingUsers(false)
    }
  }

  const debouncedSearch = useRef(
    debounce((query: string) => {
      handleSearchUsers(query)
    }, 300),
  ).current

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
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

  const filteredGroupChats = groupChats.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Conversations sidebar */}
      <div className="w-full border-r md:w-80">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">Messages</h1>
              <Button variant="ghost" size="icon" onClick={() => setShowNewGroupDialog(true)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Group</span>
              </Button>
            </div>
            <div className="relative">
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

          <Tabs
            defaultValue="direct"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "direct" | "groups")}
          >
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="direct" className="flex-1">
                  Direct
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1">
                  Groups
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="direct" className="flex-1 overflow-auto">
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
            </TabsContent>

            <TabsContent value="groups" className="flex-1 overflow-auto">
              {filteredGroupChats.length > 0 ? (
                <div className="divide-y">
                  {filteredGroupChats.map((group) => (
                    <div
                      key={group._id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedGroupChat?._id === group._id ? "bg-muted" : ""
                        }`}
                      onClick={() => handleSelectGroupChat(group)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Users className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{group.name}</span>
                            <span className="text-xs text-muted-foreground">{formatMessageTime(group.updatedAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{group.members.length} members</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No group chats yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new group chat to get started</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowNewGroupDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group Chat
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedUser || selectedGroupChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedUser ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedGroupChat?.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedGroupChat?.members.length} members</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedUser ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/profile/${selectedUser._id}`}>View Profile</Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Group Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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
                          {!isOwnMessage && selectedGroupChat && (
                            <p className="text-xs font-medium mb-1">{message.sender.name}</p>
                          )}
                          <div
                            className={`rounded-lg p-3 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="mt-2">
                                    {attachment.type.startsWith("image/") ? (
                                      <img
                                        src={attachment.url || "/placeholder.svg"}
                                        alt="Attachment"
                                        className="max-w-full rounded-md max-h-60 object-contain"
                                      />
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs underline"
                                      >
                                        <Paperclip className="h-3 w-3" />
                                        Attachment
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</p>
                            {isOwnMessage && message.read && (
                              <span className="text-xs text-muted-foreground">Read</span>
                            )}
                          </div>
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
            <div className="px-4">{selectedUser && <TypingIndicator userId={selectedUser._id} />}</div>

            {/* Message input */}
            <div className="p-4 border-t">
              {attachment && (
                <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setAttachment(null)}>
                    <span className="sr-only">Remove attachment</span>X
                  </Button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleInputChange}
                  className="pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAttachmentClick}
                    disabled={sendingMessage}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon">
                        <Smile className="h-4 w-4" />
                        <span className="sr-only">Pick emoji</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border-none shadow-none">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </PopoverContent>
                  </Popover>
                  <Button type="submit" variant="ghost" size="icon" disabled={sendingMessage}>
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* New Group Dialog */}
      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">Create Group</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <Textarea
                id="description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="members" className="text-right">
                Members
              </label>
              <div className="col-span-3">
                <Input type="search" placeholder="Search users..." onChange={handleUserSearchChange} />
                {searchingUsers ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <ScrollArea className="h-48 w-full rounded-md border">
                    {searchResults.map((user) => (
                      <div key={user._id} className="p-2 hover:bg-muted cursor-pointer flex items-center gap-2">
                        <Checkbox
                          id={`user-${user._id}`}
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => toggleUserSelection(user._id)}
                        />
                        <label htmlFor={`user-${user._id}`} className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                          <VerificationBadge size="sm" />
                        </label>
                      </div>
                    ))}
                  </ScrollArea>
                ) : null}
              </div>
            </div>
          </div>
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
