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
                            {post.verified && <BadgeCheck className="ml-1 text-blue-500" size={14} />}
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
