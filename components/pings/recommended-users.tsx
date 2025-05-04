"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import VerificationBadge from "../verification-badge"

type RecommendedUser = {
  _id: string
  name: string
  username: string
  profilePic?: string
  bio?: string
  role?: string
  skills?: { name: string; level: string }[]
  verified?: boolean
  matchingSkills: number
  recommendedByRole?: boolean
}

export default function RecommendedUsers() {
  const [users, setUsers] = useState<RecommendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})
  const [followingInProgress, setFollowingInProgress] = useState<Record<string, boolean>>({})
    const {toast} = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations`)

        if (!res.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await res.json()
        setUsers(data)

        // Initialize following status
        const initialStatus: Record<string, boolean> = {}
        data.forEach((user: RecommendedUser) => {
          initialStatus[user._id] = false
        })
        setFollowingStatus(initialStatus)
      } catch (error: any) {
        console.error("Error fetching recommendations:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const handleFollow = async (userId: string) => {
    setFollowingInProgress((prev) => ({ ...prev, [userId]: true }))

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/follow/${userId}`, {
        method: "POST",
      })

      if (res.ok) {
        setFollowingStatus((prev) => ({
          ...prev,
          [userId]: !prev[userId],
        }))

        // Remove user from recommendations if followed
        if (!followingStatus[userId]) {
          setUsers((prev) => prev.filter((user) => user._id !== userId))
        }
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to follow user")
      }
    } catch (error: any) {
      console.error("Error following user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      })
    } finally {
      setFollowingInProgress((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recommended Connections
          </CardTitle>
          <CardDescription>Developers you might want to connect with</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recommended Connections
        </CardTitle>
        <CardDescription>Developers with similar skills and interests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.slice(0, 5).map((user) => (
          <div key={user._id} className="flex items-start gap-3">
            <Link href={`/profile/${user._id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user._id}`} className="font-medium truncate hover:underline">
                  {user.name}
                </Link>
                {user.verified && <VerificationBadge size="sm" />}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.role || `@${user.username}`}</p>
              {user.matchingSkills > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user.matchingSkills} shared {user.matchingSkills === 1 ? "skill" : "skills"}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleFollow(user._id)}
              disabled={followingInProgress[user._id]}
            >
              {followingInProgress[user._id] ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserPlus className="h-3 w-3" />
              )}
              <span className="sr-only md:not-sr-only md:inline-flex">Connect</span>
            </Button>
          </div>
        ))}
        {users.length > 5 && (
          <Button variant="ghost" className="w-full text-sm" asChild>
            <Link href="/network">View More Recommendations</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
