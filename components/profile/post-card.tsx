"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Share2 } from "lucide-react"

type Post = {
    _id: string
    text: string
    user: {
        _id: string
        name: string
        username: string
        profilePic: string
    }
    createdAt: string
    likes: string[]
    replies: {
        _id: string
        text: string
        userId: string
        username: string
        userProfilePic: string
        createdAt: string
    }[]
    image?: string
}

interface PostCardProps {
    post: Post
}

export default function PostCard({ post }: PostCardProps) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(post.likes.includes(user?._id || ""))
    const [likesCount, setLikesCount] = useState(post.likes.length)
    const [showReplies, setShowReplies] = useState(false)
    const [replyText, setReplyText] = useState("")
    const [replies, setReplies] = useState(post.replies)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLike = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/pings/like/${post._id}`, {
                method: "POST",
                credentials: "include",
            })

            if (res.ok) {
                setLiked(!liked)
                setLikesCount(liked ? likesCount - 1 : likesCount + 1)
            }
        } catch (error) {
            console.error("Error liking post:", error)
        }
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyText.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`http://localhost:5000/api/pings/reply/${post._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: replyText }),
                credentials: "include",
            })

            const data = await res.json()
            setReplies([...replies, data])
            setReplyText("")
        } catch (error) {
            console.error("Error replying to post:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            ?.map((n) => n[0])
            ?.join("")
            ?.toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Link href={`/profile/${post.user?._id}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post?.user?.profilePic || "/placeholder.svg"} alt={post?.user?.name} />
                            <AvatarFallback>{getInitials(post?.user?.name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${post?.user?._id}`} className="font-semibold hover:underline">
                                {post?.user?.name}
                            </Link>
                            <Link href={`/profile/${post?.user?._id}`} className="text-sm text-muted-foreground hover:underline">
                                @{post?.user?.username}
                            </Link>
                            <span className="text-sm text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">{formatDate(post?.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-loose">{post?.text}</p>
                        {post?.image && (
                            <img src={post?.image || "/placeholder.svg"} alt="Post attachment" className="mt-3 rounded-lg border" />
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="gap-1" onClick={handleLike}>
                        <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{likesCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowReplies(!showReplies)}>
                        <MessageSquare className="h-4 w-4" />
                        <span>{replies.length}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
            {showReplies && (
                <div className="border-t px-6 py-4">
                    <div className="space-y-4">
                        {replies.map((reply) => (
                            <div key={reply._id} className="flex gap-3">
                                <Link href={`/profile/${reply.userId}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={reply.userProfilePic || "/placeholder.svg"} alt={reply.username} />
                                        <AvatarFallback>{reply.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1 rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/profile/${reply.userId}`} className="font-semibold text-sm hover:underline">
                                            {reply.username}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-sm mt-1">{reply.text}</p>
                                </div>
                            </div>
                        ))}
                        <form onSubmit={handleReply} className="flex gap-3 pt-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.profilePic || "/placeholder.svg"} alt={user?.name || ""} />
                                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="Write a reply..."
                                    className="min-h-[80px]"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <Button type="submit" size="sm" disabled={!replyText.trim() || isSubmitting}>
                                    {isSubmitting ? "Replying..." : "Reply"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    )
}
