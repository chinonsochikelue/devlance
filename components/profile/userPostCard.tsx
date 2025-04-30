"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MoreHorizontal, Heart, MessageCircle, Repeat, Share2, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Dummy posts array
const posts = [
    {
        id: 1,
        username: "soren.iverson",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
        timeAgo: "1d",
        content: "iMessage option to see and join message threads when people are talking about you",
        image: "https://www.aretove.com/wp-content/uploads/2024/01/AdobeStock_639749342-1.jpeg",
        replies: 20,
        likes: 865,
    },
    {
        id: 2,
        username: "john.doe",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: false,
        timeAgo: "3h",
        content: "Exploring the new React Server Components — super exciting!",
        image: "https://cdn.thecollector.com/wp-content/uploads/2023/08/quantum-mechanics-science-karl-popper.jpg?width=1400&quality=70",
        replies: 5,
        likes: 123,
    },
    {
        id: 3,
        username: "jane.smith",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
        timeAgo: "2d",
        content: "Nature always wears the colors of the spirit 🍃",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=640",
        replies: 12,
        likes: 450,
    },
]

const UserPostCard = ({user}: { user: any }) => {
    const { toast } = useToast()

    return (
        <div className="mt-4 space-y-8">
            {posts.map((post) => (
                <SinglePost key={post.id} post={post} toast={toast} user={user} />
            ))}
        </div>
    )
}
    
const SinglePost = ({ post, toast, user }: { post: typeof posts[number]; toast: any; user: any }) => {
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [bookmarked, setBookmarked] = useState(false)
    const [showCommentInput, setShowCommentInput] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [reposted, setReposted] = useState(false)

    const handleLike = () => {
        if (liked) setLikesCount((prev) => prev - 1)
        else setLikesCount((prev) => prev + 1)
        setLiked(!liked)
    }

    const handleRepost = () => {
        setReposted(!reposted)
        if (!reposted) {
            toast({
                title: "Post reposted",
                description: "This post has been added to your profile",
            })
        }
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

    const handleShare = () => {
        toast({
            title: "Share options",
            description: "Sharing options would appear here",
        })
    }

    return (
        <div className="border-b border-gray-800 p-4">
            {/* User info */}
            <div className="flex justify-between mb-2">
                <div className="flex items-center">
                    <Avatar className="w-10 h-10 border border-gray-700">
                        <AvatarImage src={user?.avatar} alt="Profile" />
                        <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                        <div className="flex items-center">
                            <span
                                className="font-semibold cursor-pointer hover:underline"
                                onClick={() => toast({ title: "Navigation", description: `View profile for @${user.username}` })}
                            >
                                {user.username}
                            </span>
                            {post.verified && (
                               <BadgeCheck className="ml-1 text-blue-500" size={14} />
                            )}
                        </div>
                        <div className="text-gray-500 text-sm">{post.timeAgo}</div>
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

            {/* Post content */}
            <div className="mb-3">
                <p className="mb-4">{post.content}</p>
                <div
                    className="rounded-xl overflow-hidden border border-gray-700 mb-2 cursor-pointer"
                    onClick={() => toast({ title: "Image", description: "Viewing full image" })}
                >
                    <Image src={post.image} alt="Post" width={300} height={400} className="w-full" priority />
                </div>
            </div>

            {/* Post actions */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setShowCommentInput(!showCommentInput)}
                    >
                        <MessageCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm">{post.replies} replies</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 ${reposted ? "text-green-500" : ""}`}
                        onClick={handleRepost}
                    >
                        <Repeat className={`w-5 h-5 ${reposted ? "text-green-500" : ""}`} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 ${liked ? "text-red-500" : ""}`}
                        onClick={handleLike}
                    >
                        <Heart className={`w-5 h-5 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                        <span className="text-sm">{likesCount} likes</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleShare}>
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Comment input */}
            {showCommentInput && (
                <form onSubmit={handleCommentSubmit} className="mt-4">
                    <div className="flex gap-2">
                        <Avatar className="w-8 h-8 border border-gray-700">
                            <AvatarImage src={post.avatar} alt="Profile" />
                            <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 rounded-lg border border-gray-700 bg-transparent p-2 text-sm"
                        />
                        <Button type="submit" size="sm">
                            Reply
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default UserPostCard
