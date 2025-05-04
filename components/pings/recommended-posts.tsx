"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import VerificationBadge from "../verification-badge"

type RecommendedPost = {
  _id: string
  text: string
  image?: string
  createdAt: string
  likes: string[]
  replies: any[]
  user: {
    _id: string
    name: string
    username: string
    profilePic?: string
    verified?: boolean
  }
}

export default function RecommendedPosts() {
  const [posts, setPosts] = useState<RecommendedPost[]>([])
  const [loading, setLoading] = useState(true)
  const {toast} = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations/posts`)

        if (!res.ok) {
          throw new Error("Failed to fetch recommended posts")
        }

        const data = await res.json()
        setPosts(data)
      } catch (error: any) {
        console.error("Error fetching recommended posts:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load recommended posts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended Posts
          </CardTitle>
          <CardDescription>Posts that might interest you based on your skills</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recommended Posts
        </CardTitle>
        <CardDescription>Posts that might interest you based on your skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.user._id}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.user.profilePic || "/placeholder.svg"} alt={post.user.name} />
                  <AvatarFallback>{getInitials(post.user.name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${post.user._id}`} className="text-sm font-medium hover:underline">
                    {post.user.name}
                  </Link>
                  {post.user.verified && <VerificationBadge size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <Link href={`/post/${post._id}`} className="block">
              <p className="text-sm line-clamp-2">{post.text}</p>
              {post.image && (
                <div className="mt-2 h-24 w-full overflow-hidden rounded-md">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post attachment"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.likes.length} likes</span>
              <span>•</span>
              <span>{post.replies.length} replies</span>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-sm" asChild>
          <Link href="/feed">View More Posts</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
