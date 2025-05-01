"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, Bookmark, Share, ImageIcon, Smile } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPosts } from "@/lib/api"
import type { Post } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LinkPreview from "./link-preview"

export default function Pings() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const data = await fetchPosts()
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      ),
    )
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  const handleCommentInput = (postId: string, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }))
  }

  const submitComment = (postId: string) => {
    if (!commentInputs[postId]?.trim()) return

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [
                ...(post.commentsList || []),
                {
                  id: `new-${Date.now()}`,
                  user: {
                    id: "currentuser",
                    name: "You",
                    username: "user",
                    avatar: "/placeholder.svg?height=40&width=40",
                    verified: false,
                  },
                  content: commentInputs[postId],
                  timestamp: "Just now",
                },
              ],
            }
          : post,
      ),
    )

    // Clear input
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }))
  }

  const loadingSkeletons = Array(3)
    .fill(0)
    .map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.1 }}
      >
        <Card className="overflow-hidden mb-4">
          <CardHeader className="p-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-40 w-full mt-4" />
          </CardContent>
          <CardFooter className="p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    ))

  if (loading) {
    return <div className="space-y-4">{loadingSkeletons}</div>
  }

  return (
    <div className="space-y-4" ref={feedRef}>
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="mb-4"
          >
            <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10 border ring-2 ring-offset-2 ring-purple-500">
                      <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{post.user.name}</p>
                        {post.user.verified && (
                          <svg className="h-4 w-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="cursor-pointer">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Save post</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Share className="mr-2 h-4 w-4" />
                        <span>Share post</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-500">
                        <svg
                          className="mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 9v4"></path>
                          <path d="M12 17h.01"></path>
                          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        </svg>
                        <span>Report post</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="mb-3 whitespace-pre-line">{post.content}</p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.link && <LinkPreview url={post.link} />}

                {post.image && (
                  <motion.div
                    className="mt-3 rounded-md overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post image"
                      className="w-full object-cover rounded-md hover:brightness-105 transition-all duration-300"
                    />
                  </motion.div>
                )}

                {post.video && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <video src={post.video} controls className="w-full rounded-md" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t flex flex-col">
                <div className="flex items-center space-x-1 w-full mb-2">
                  <motion.button
                    whileTap={{ scale: 1.2 }}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
                      post.isLiked
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } transition-colors`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 1.1 }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </motion.button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        whileTap={{ scale: 1.1 }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Repeat className="h-4 w-4" />
                        <span>{post.shares}</span>
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share this post</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="social">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="social">Social Media</TabsTrigger>
                          <TabsTrigger value="copy">Copy Link</TabsTrigger>
                        </TabsList>
                        <TabsContent value="social" className="p-4">
                          <div className="grid grid-cols-4 gap-4">
                            {["Twitter", "Facebook", "LinkedIn", "WhatsApp"].map((platform) => (
                              <Button
                                key={platform}
                                variant="outline"
                                className="h-20 flex flex-col items-center justify-center gap-2"
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs">{platform[0]}</span>
                                </div>
                                <span className="text-xs">{platform}</span>
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="copy" className="p-4">
                          <div className="flex space-x-2">
                            <Input value="https://example.com/post/123" readOnly />
                            <Button variant="secondary">Copy</Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  <motion.button
                    whileTap={{ scale: 1.1 }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {expandedComments.includes(post.id) && (
                    <motion.div
                      className="w-full mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="border-t pt-3 space-y-3">
                        {(post.commentsList || []).map((comment) => (
                          <div key={comment.id} className="flex space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                              <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
                              <div className="flex items-center">
                                <p className="text-xs font-medium">{comment.user.name}</p>
                                {comment.user.verified && (
                                  <svg className="h-3 w-3 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                )}
                                <span className="text-xs text-gray-500 ml-2">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center space-x-2 mt-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your profile" />
                            <AvatarFallback>YP</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Write a comment..."
                              className="pr-10 bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-purple-500"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) => handleCommentInput(post.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  submitComment(post.id)
                                }
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 absolute right-1 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-600 hover:bg-transparent"
                              onClick={() => submitComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
