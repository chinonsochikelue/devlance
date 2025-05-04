"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SuggestedUser = {
  _id: string
  name: string
  username: string
  profilePic: string
  bio?: string
}

export default function UserSuggestions() {
  const { user } = useAuth()
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/suggested`, {
          credentials: "include",
        })
        const data = await res.json()
        setSuggestedUsers(data)

        // Initialize following status
        const initialStatus: Record<string, boolean> = {}
        data.forEach((user: SuggestedUser) => {
          initialStatus[user._id] = false
        })
        setFollowingStatus(initialStatus)
      } catch (error) {
        console.error("Error fetching suggested users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedUsers()
  }, [])

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/follow/${userId}`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        setFollowingStatus((prev) => ({
          ...prev,
          [userId]: !prev[userId],
        }))
      }
    } catch (error) {
      console.error("Error following user:", error)
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
          <CardTitle>Who to follow</CardTitle>
          <CardDescription>Suggested developers for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 rounded bg-muted"></div>
                <div className="h-3 w-16 rounded bg-muted"></div>
              </div>
              <div className="h-8 w-16 rounded bg-muted"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (suggestedUsers.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to follow</CardTitle>
        <CardDescription>Suggested developers for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((suggestedUser) => (
          <div key={suggestedUser._id} className="flex items-center gap-4">
            <Link href={`/profile/${suggestedUser._id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={suggestedUser.profilePic || "/placeholder.svg"} alt={suggestedUser.name} />
                <AvatarFallback>{getInitials(suggestedUser.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 space-y-1">
              <Link href={`/profile/${suggestedUser._id}`} className="font-medium hover:underline">
                {suggestedUser.name}
              </Link>
              <p className="text-sm text-muted-foreground">@{suggestedUser.username}</p>
            </div>
            <Button
              variant={followingStatus[suggestedUser._id] ? "outline" : "default"}
              size="sm"
              onClick={() => handleFollow(suggestedUser._id)}
            >
              {followingStatus[suggestedUser._id] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
