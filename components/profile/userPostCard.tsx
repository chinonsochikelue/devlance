"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Heart, MessageCircle, Repeat, Share2, BadgeCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import VerifiedBadge from "./verified-badge"
import VerificationBadge from "../verification-badge"

const UserPostCard = ({ user, post }: { user: any, post: any }) => {
    const { toast } = useToast()
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [bookmarked, setBookmarked] = useState(false)
    const [showCommentInput, setShowCommentInput] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [reposted, setReposted] = useState(false)
    console.log(post)

    const handleLike = () => {
        setLiked(prev => !prev)
        setLikesCount(prev => liked ? prev - 1 : prev + 1)
    }

    const handleRepost = () => {
        setReposted(prev => !prev)
        if (!reposted) {
            toast({
                title: "Post reposted",
                description: "This post has been added to your profile",
            })
        }
    }

    const handleShare = () => {
        toast({
            title: "Share options",
            description: "Sharing options would appear here",
        })
    }

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (commentText.trim()) {
            toast({
                title: "Comment posted",
                description: "Your reply has been added",
            })
            setCommentText("")
            setShowCommentInput(false)
        }
    }

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    }



    return (
        <div className="border-b border-gray-800 p-4 space-y-2">
            {/* Header */}
            <div className="flex justify-between">
                <div className="flex items-center">
                    <Avatar className="w-10 h-10 border border-gray-700">
                        <AvatarImage src={user?.avatar} alt="Profile" />
                        <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                        <div className="flex items-center">
                            <span
                                className="font-semibold cursor-pointer hover:underline"
                                onClick={() => toast({ title: "Navigation", description: `View profile for @${user.username}` })}
                            >
                                {user.username}
                            </span>
                            {user.verified && (
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="#1d9bf0"
                                className="flex-shrink-0"
                              >
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                              </svg>
                            )}
                        </div>
                        <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setBookmarked(!bookmarked)}>
                            {bookmarked ? "Remove bookmark" : "Bookmark"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Action", description: "Copied link to post" })}>
                            Copy link
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <p>{post.text}</p>
            {post.img && (
                <div
                    className="rounded-xl overflow-hidden border border-gray-700 mb-2 cursor-pointer"
                    onClick={() => toast({ title: "Image", description: "Viewing full image" })}
                >
                    <Image src={post.img} alt="Post image" width={500} height={400} className="w-full" priority />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setShowCommentInput(!showCommentInput)}>
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span>{post.replies.lengths} replies</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRepost}
                    className={reposted ? "text-green-500" : ""}
                >
                    <Repeat className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={liked ? "text-red-500" : ""}
                >
                    <Heart className={`w-5 h-5 mr-1 ${liked ? "fill-red-500" : ""}`} />
                    <span>{likesCount} likes</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Comment Input */}
            {showCommentInput && (
                <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-2">
                    <Avatar className="w-8 h-8 border border-gray-700">
                        <AvatarImage src={user?.avatar} alt="Profile" />
                        <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 rounded-lg border border-gray-700 bg-transparent p-2 text-sm"
                    />
                    <Button type="submit" size="sm">Reply</Button>
                </form>
            )}
        </div>
    )
}

export default UserPostCard
