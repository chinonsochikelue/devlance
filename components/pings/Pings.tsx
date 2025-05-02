"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchFeedPostsWithUsers, likeUnlikePost, replyToPost, formatTimestamp, createPost } from "@/lib/api"
import type { PostWithUser } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function SocialFeed() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [newPostText, setNewPostText] = useState("")
  const [newPostImage, setNewPostImage] = useState("")
  const [submittingPost, setSubmittingPost] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const feedRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts()
    }
  }, [isAuthenticated])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const postsWithUsers = await fetchFeedPostsWithUsers()
      setPosts(postsWithUsers)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      })
      return
    }

    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          const userLiked = post.likes.includes(user?._id || "")
          return {
            ...post,
            likes: userLiked ? post.likes.filter((id) => id !== user?._id) : [...post.likes, user?._id || ""],
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Call API
      await likeUnlikePost(postId)
    } catch (error) {
      console.error("Failed to like/unlike post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
      // Revert optimistic update
      loadPosts()
    }
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

  const submitComment = async (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to posts",
        variant: "destructive",
      })
      return
    }

    if (!commentInputs[postId]?.trim()) return

    try {
      const text = commentInputs[postId]

      // Clear input immediately for better UX
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }))

      // Call API to submit reply
      const newReply = await replyToPost(postId, text)

      // Update posts state with new reply
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              replies: [...post.replies, newReply],
            }
          }
          return post
        }),
      )

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      })
    } catch (error) {
      console.error("Failed to submit comment:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    }
  }


  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="w-full">
              <div className="flex items-center gap-1 mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-40 w-full rounded-xl mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))

  if (loading) {
    return <div>{loadingSkeletons}</div>
  }

  return (
    <div ref={feedRef}>

      <AnimatePresence>
        {posts.map((post, index) => {
          const userDetails = post.postedBy
          const isLiked = post.likes.includes(user?._id || "")
          const hasReplies = post.replies && post.replies.length > 0
          const isThread = post.parentId !== undefined

          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={userDetails.profilePic || "/placeholder.svg?height=40&width=40"}
                        alt={userDetails.username}
                      />
                      <AvatarFallback>{userDetails.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {/* Thread line that connects to replies */}
                    {(hasReplies || isThread) && expandedComments.includes(post._id) && (
                      <div
                        className="absolute top-10 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-800"
                        style={{ height: "calc(100% - 20px)", transform: "translateX(-50%)" }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-black dark:text-white">
                        {userDetails.name || userDetails.username}
                      </span>
                      {userDetails.verified && (
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
                      <span className="text-gray-500 truncate">
                        @{userDetails.username} · {formatTimestamp(post.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ml-auto text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
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
                            <span>Not interested in this tweet</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
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
                              <path d="M17 14V2"></path>
                              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"></path>
                              <path d="M8 21h8"></path>
                              <path d="M12 17v4"></path>
                            </svg>
                            <span>Follow @{userDetails.username}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
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
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                              <line x1="9" x2="15" y1="15" y2="9"></line>
                            </svg>
                            <span>Embed Tweet</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Reply to indicator */}
                    {post.parentId && (
                      <div className="text-gray-500 text-sm mb-1">
                        Replying to <span className="text-blue-500">@{userDetails.username}</span>
                      </div>
                    )}

                    <div className="mt-1 text-black dark:text-white whitespace-pre-line">{post.text}</div>

                    {post.img && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        <img src={post.img || "/placeholder.svg"} alt="Post image" className="w-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between mt-3 text-gray-500 max-w-md">
                      <button className="flex items-center group" onClick={() => toggleComments(post._id)}>
                        <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <span className="ml-1 text-sm group-hover:text-blue-500">
                          {formatCount(post.replies.length)}
                        </span>
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex items-center group">
                            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-500 transition-colors">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m17 2 4 4-4 4" />
                                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                                <path d="m7 22-4-4 4-4" />
                                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                              </svg>
                            </div>
                            <span className="ml-1 text-sm group-hover:text-green-500">0</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Retweet</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 py-4">
                            <button className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-3 text-green-500"
                              >
                                <path d="m17 2 4 4-4 4" />
                                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                                <path d="m7 22-4-4 4-4" />
                                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                              </svg>
                              <span>Retweet</span>
                            </button>
                            <button className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-3 text-green-500"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                <path d="M17 11h.01" />
                                <path d="M12 11h.01" />
                                <path d="M7 11h.01" />
                              </svg>
                              <span>Quote Tweet</span>
                            </button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <button className="flex items-center group" onClick={() => handleLike(post._id)}>
                        <div
                          className={`p-2 rounded-full ${
                            isLiked
                              ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                              : "group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500"
                          } transition-colors`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isLiked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </div>
                        <span className={`ml-1 text-sm ${isLiked ? "text-red-500" : "group-hover:text-red-500"}`}>
                          {formatCount(post.likes.length)}
                        </span>
                      </button>
                      <button className="flex items-center group">
                        <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedComments.includes(post._id) && (
                        <motion.div
                          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {post.replies.map((reply, commentIndex) => (
                            <div key={reply._id} className="flex gap-2 mb-3 relative">
                              <div className="relative">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={reply.userProfilePic || "/placeholder.svg"} alt={reply.username} />
                                  <AvatarFallback>{reply.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {/* Thread line connecting comments */}
                                {commentIndex < post.replies.length - 1 && (
                                  <div
                                    className="absolute top-8 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-800"
                                    style={{ height: "calc(100% + 12px)", transform: "translateX(-50%)" }}
                                  ></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-black dark:text-white text-sm">{reply.username}</span>
                                  <span className="text-gray-500 text-xs">@{reply.username} · Just now</span>
                                </div>
                                <p className="text-sm text-black dark:text-white">{reply.text}</p>
                                <div className="flex gap-6 mt-1 text-xs text-gray-500">
                                  <button className="hover:text-blue-500">Reply</button>
                                  <button className="hover:text-red-500">Like</button>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 mt-3 relative">
                            <div className="relative">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                  src={user?.profilePic || "/placeholder.svg?height=40&width=40"}
                                  alt={user?.name || "Your profile"}
                                />
                                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "YP"}</AvatarFallback>
                              </Avatar>
                              {/* Connect line from last comment to reply input */}
                              {post.replies.length > 0 && (
                                <div
                                  className="absolute top-0 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-800"
                                  style={{ height: "8px", transform: "translateX(-50%)" }}
                                ></div>
                              )}
                            </div>
                            <div className="flex-1 relative">
                              <Input
                                placeholder="Tweet your reply"
                                className="bg-transparent border rounded-full text-sm focus-visible:ring-blue-500 focus-visible:ring-1"
                                value={commentInputs[post._id] || ""}
                                onChange={(e) => handleCommentInput(post._id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    submitComment(post._id)
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-600 text-white h-6 w-6 p-0"
                                onClick={() => submitComment(post._id)}
                                disabled={!commentInputs[post._id]?.trim()}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m22 2-7 20-4-9-9-4Z" />
                                  <path d="M22 2 11 13" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
