"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"

interface Follower {
  id: string
  name: string
  avatar: string
  followedTime: string
  isFollowing: boolean
}

interface user {
  id: string;
  name: string;
  avatar: string;
  followedTime: string;
  isFollowing: boolean;
  followers?: any[];
}

interface FollowersListProps {
  user: any // You can replace `any` with your proper User type
}

export default function FollowList({ user }: FollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([
    {
      id: "1",
      name: "Thomas C. Slaton",
      avatar: "/placeholder.svg?height=40&width=40",
      followedTime: "28d",
      isFollowing: false,
    },
    {
      id: "2",
      name: "Michael M. Welch",
      avatar: "/placeholder.svg?height=40&width=40",
      followedTime: "2m",
      isFollowing: true,
    },
    {
      id: "3",
      name: "Joseph K. Engler",
      avatar: "/placeholder.svg?height=40&width=40",
      followedTime: "3m",
      isFollowing: false,
    },
    {
      id: "4",
      name: "Yolanda R. Jeffries",
      avatar: "/placeholder.svg?height=40&width=40",
      followedTime: "7m",
      isFollowing: true,
    },
    {
      id: "5",
      name: "Nichole T. Morris",
      avatar: "/placeholder.svg?height=40&width=40",
      followedTime: "8m",
      isFollowing: false,
    },
  ])

  const [loading, setLoading] = useState(true)
  const [pendingFollows, setPendingFollows] = useState<Set<string>>(new Set())
  const isMobile = useMobile()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const toggleFollow = async (id: string) => {
    setPendingFollows((prev) => new Set(prev).add(id))

    await new Promise((resolve) => setTimeout(resolve, 800))

    setFollowers((prev) =>
      prev.map((follower) =>
        follower.id === id
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower,
      ),
    )

    setPendingFollows((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  return (
    <div className="min-h-screen w-full max-w-full sm:max-w-md mx-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Suggested Users</h2>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-800 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-800" />
                      <Skeleton className="h-3 w-24 bg-gray-800" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full bg-gray-800" />
                </div>
              ))
          ) :

            <div
              key={user?._id}
              className="flex items-center justify-between py-3 border-b border-gray-800 transition-all hover:bg-gray-900/30"
            >
              <div className="flex items-center gap-3">
                <Link href={`/profile/${user._id}`}>
                  <div className="relative">
                    <Avatar
                      className={cn(
                        "h-10 w-10 border-2 border-gray-700 transition-transform",
                        "hover:scale-105 focus-within:ring-2 focus-within:ring-purple-500",
                      )}
                    >
                      <AvatarImage src={user?.profilePic} alt={user?.name} />
                      <AvatarFallback className="bg-gray-700">
                        {user?.name
                          ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                          : "NA"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <Users className="h-3 w-3 text-black" />
                    </div>
                  </div>
                </Link>
                <div>
                  <Link href={`/profile/${user._id}`}>
                    <p className="text-sm font-bold">
                      {user.name.length > 18
                        ? `${user.name.slice(0, 18)}...`
                        : user.name}
                    </p>
                    <p className="sm:text-xs text-gray-400">
                      {user?.followers?.length} · Followers
                    </p>
                  </Link>
                </div>
              </div>
              <Button
                onClick={() => toggleFollow(user?.id)}
                disabled={pendingFollows.has(user.id)}
                className={cn(
                  "rounded-full sm:px-3 py-1 h-8 sm:text-sm font-medium transition-all cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500",
                  user?.isFollowing
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    : "bg-gray-800 hover:bg-gray-700",
                )}
              >
                {pendingFollows.has(user.id) ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isMobile ? "" : user?.isFollowing ? "Following" : "Follow"}
                  </span>
                ) : user?.isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </Button>
            </div>}
        </div>

        {!loading && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white transition-all"
            >
              View all followers
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}














































"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

type User = {
  _id: string
  name: string
  username: string
  profilePic?: string
  bio?: string
  followers?: string[]
  following?: string[]
}

export default function NetworkPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/all", {
          credentials: "include",
        })
        const data = await res.json()
console.log(data)
        // Filter out current user
        const filteredData = data.filter((user: User) => user._id !== currentUser?._id)
        setUsers(filteredData)
        setFilteredUsers(filteredData)

        // Initialize following status
        const initialStatus: Record<string, boolean> = {}
        filteredData.forEach((user: User) => {
          initialStatus[user._id] = user.followers?.includes(currentUser?._id || "") || false
        })
        setFollowingStatus(initialStatus)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/follow/${userId}`, {
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

  const getFollowing = () => {
    return filteredUsers.filter((user) => followingStatus[user._id])
  }

  const getNotFollowing = () => {
    return filteredUsers.filter((user) => !followingStatus[user._id])
  }

  const renderUserCard = (user: User) => (
    <Card key={user._id} className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-100"></div>
      <CardContent className="p-6 pt-0">
        <div className="flex justify-between">
          <Avatar className="-mt-12 h-20 w-20 border-4 border-background">
            <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <Button
            variant={followingStatus[user._id] ? "outline" : "default"}
            size="sm"
            className="mt-2"
            onClick={() => handleFollow(user._id)}
          >
            {followingStatus[user._id] ? "Following" : "Follow"}
          </Button>
        </div>
        <div className="mt-3">
          <Link href={`/profile/${user._id}`} className="font-semibold hover:underline">
            {user.name}
          </Link>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm line-clamp-2">{user.bio}</p>}
          <div className="mt-3 flex gap-4 text-sm">
            <p>
              <span className="font-medium">{user.followers?.length || 0}</span> followers
            </p>
            <p>
              <span className="font-medium">{user.following?.length || 0}</span> following
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-full rounded-md bg-muted"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-24 bg-muted"></div>
              <CardContent className="p-6 pt-0">
                <div className="flex justify-between">
                  <div className="-mt-12 h-20 w-20 rounded-full bg-muted border-4 border-background"></div>
                  <div className="mt-2 h-8 w-20 rounded bg-muted"></div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-5 w-32 rounded bg-muted"></div>
                  <div className="h-4 w-24 rounded bg-muted"></div>
                  <div className="h-4 w-full rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search developers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="lg:text-xs">All Developers</TabsTrigger>
          <TabsTrigger value="following" className="lg:text-xs">Following</TabsTrigger>
          <TabsTrigger value="discover" className="lg:text-xs">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map(renderUserCard)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardTitle className="text-lg">No developers found</CardTitle>
              <CardDescription>Try adjusting your search query</CardDescription>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {getFollowing().length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getFollowing().map(renderUserCard)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardTitle className="text-lg">Not following anyone yet</CardTitle>
              <CardDescription>Follow developers to see them here</CardDescription>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="discover" className="mt-6">
          {getNotFollowing().length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getNotFollowing().map(renderUserCard)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardTitle className="text-lg">No new developers to discover</CardTitle>
              <CardDescription>You're following everyone!</CardDescription>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
