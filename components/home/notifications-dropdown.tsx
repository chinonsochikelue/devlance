"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Check, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import VerificationBadge from "@/components/verification-badge"
import { useToast } from "@/hooks/use-toast"

type Notification = {
    _id: string
    type: "follow" | "like" | "comment" | "mention" | "endorsement" | "verification" | "message"
    content: string
    read: boolean
    sender?: {
        _id: string
        name: string
        username: string
        profilePic?: string
        verified?: boolean
    }
    relatedId?: string
    relatedModel?: string
    createdAt: string
}

export default function NotificationsDropdown({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { toast } = useToast();

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`)
            if (!res.ok) throw new Error("Failed to fetch notifications")

            const data = await res.json()
            setNotifications(data)

            // Count unread notifications
            const unread = data.filter((n: Notification) => !n.read).length
            setUnreadCount(unread)
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUnreadCount = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread`)
            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error("Error fetching unread count:", error)
        }
    }

    useEffect(() => {
        fetchUnreadCount()

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)

        if (isOpen) {
            fetchNotifications()
        }
    }

    const markAllAsRead = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/read-all`, {
                method: "PUT",
            })

            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                setUnreadCount(0)

                toast({
                    title: "Success",
                    description: "All notifications marked as read",
                })
            } else {
                throw new Error("Failed to mark notifications as read")
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error)
            toast({
                title: "Error",
                description: "Failed to mark notifications as read",
                variant: "destructive",
            })
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${id}/read`, {
                method: "PUT",
            })

            if (res.ok) {
                setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const getNotificationLink = (notification: Notification) => {
        switch (notification.type) {
            case "follow":
                return `/profile/${notification.sender?._id}`
            case "like":
            case "comment":
                return `/post/${notification.relatedId}`
            case "mention":
                return `/post/${notification.relatedId}`
            case "endorsement":
                return `/profile/${notification.sender?._id}`
            case "verification":
                return `/settings/verification`
            case "message":
                return `/messages`
            default:
                return "#"
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const formatNotificationTime = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    }

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    {children}
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary"></span>
                    )}
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-h-[60vh] overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification._id}
                                className={`flex items-start gap-3 p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                                asChild
                            >
                                <Link
                                    href={getNotificationLink(notification)}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    {notification.sender ? (
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarImage
                                                src={notification.sender.profilePic || "/placeholder.svg"}
                                                alt={notification.sender.name}
                                            />
                                            <AvatarFallback>{getInitials(notification.sender.name)}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                            <Bell className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            {notification.sender && (
                                                <span className="font-medium">
                                                    {notification.sender.name}
                                                    {notification.sender.verified && <VerificationBadge size="xs" className="ml-1" />}
                                                </span>
                                            )}{" "}
                                            {notification.content}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatNotificationTime(notification.createdAt)}
                                        </p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-muted-foreground">No notifications yet</p>
                        </div>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
