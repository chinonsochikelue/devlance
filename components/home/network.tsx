"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Briefcase, UserPlus, UserCheck, Loader2, Users } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"

type User = {
  _id: string
  name: string
  username: string
  profilePic?: string
  coverImage?: string
  bio?: string
  followers?: string[]
  following?: string[]
  role?: string
  location?: string
}

export default function NetworkPage() {
  
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})
  const [followingInProgress, setFollowingInProgress] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("all")
  const searchRef = useRef<HTMLInputElement>(null)
  const {toast} = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithAuth("http://localhost:5000/api/users/all")

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch users")
        }

        const data = await res.json()

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
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchUsers()
    } else {
      router.push("/login")
    }
  }, [currentUser, router])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const handleFollow = async (userId: string) => {
    setFollowingInProgress((prev) => ({ ...prev, [userId]: true }))
    try {
      console.log(userId)
      const res = await fetch(`http://localhost:5000/api/users/follow/${userId}`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        setFollowingStatus((prev) => ({
          ...prev,
          [userId]: !prev[userId],
        }))
        toast({
          title: 'Success!',
          description: "You've successfully followed this dev!",
        })
      }
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Try again later.',
      });
      console.error("Error following user:", error)
    } finally {
      setTimeout(() => {
        setFollowingInProgress((prev) => ({ ...prev, [userId]: false }))
      }, 600) // Add a slight delay for the animation to complete
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getFilteredUsers = () => {
    switch (activeTab) {
      case "following":
        return filteredUsers.filter((user) => followingStatus[user._id])
      case "discover":
        return filteredUsers.filter((user) => !followingStatus[user._id])
      default:
        return filteredUsers
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const focusSearch = () => {
    searchRef.current?.focus()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  }

  const renderUserCard = (user: User) => (
    <motion.div
      key={user._id}
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="overflow-hidden w-full h-full transition-all duration-300 hover:shadow-lg">
        <div className="relative h-32 overflow-hidden">
          {user.coverImage ? (
            <img
              src={user.coverImage || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-violet-200 to-pink-200"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="px-4 pb-5 pt-12 relative">
          <div className="absolute -top-10 left-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
              <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="mb-4">
            <Link href={`/profile/${user._id}`} className="font-semibold text-lg hover:underline line-clamp-1">
              {user.name}
            </Link>
            <p className="text-sm text-muted-foreground">@{user.username}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {user.role && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Briefcase className="h-3 w-3" />
                  <span className="line-clamp-1">{user.role}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{user.location}</span>
                </div>
              )}
            </div>

            {user.bio && <p className="mt-3 text-sm line-clamp-2 text-muted-foreground">{user.bio}</p>}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-3 text-xs">
              <p>
                <span className="font-medium">{user.followers?.length || 0}</span> followers
              </p>
              <p>
                <span className="font-medium">{user.following?.length || 0}</span> following
              </p>
            </div>

            <Button
              variant={followingStatus[user._id] ? "outline" : "default"}
              size="sm"
              className={`transition-all duration-300 ${followingStatus[user._id] ? "hover:bg-red-100 hover:text-red-600 hover:border-red-200" : ""}`}
              onClick={() => handleFollow(user._id)}
              disabled={followingInProgress[user._id]}
            >
              {followingInProgress[user._id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : followingStatus[user._id] ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span className="group-hover:hidden">Following</span>
                  <span className="hidden group-hover:inline">Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const renderSkeletonCards = () => {
    return Array(9)
      .fill(0)
      .map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="h-full"
        >
          <Card className="overflow-hidden h-full">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
            <div className="px-4 pb-5 pt-12 relative">
              <div className="absolute -top-10 left-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-background animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-6 mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">Find Developers</h1>
          <p className="text-muted-foreground mb-4">Connect with developers from around the world</p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              placeholder="Search by name, username, role, or location..."
              className="pl-9 pr-4 py-2 bg-white/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        <Tabs defaultValue="discover" value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="discover" onClick={focusSearch} className="lg:text-xs">
              Discover
            </TabsTrigger>
            <TabsTrigger value="all" onClick={focusSearch} className="lg:text-xs">
              All Devs
            </TabsTrigger>
            <TabsTrigger value="following" onClick={focusSearch} className="lg:text-xs">
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="gap-6">{renderSkeletonCards()}</div>
            ) : getFilteredUsers().length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="gap-6"
              >
                {getFilteredUsers().map(renderUserCard)}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4 border rounded-lg bg-background"
              >
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No developers found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any developers matching your search. Try adjusting your search terms or clear the
                  search to see all developers.
                </p>
                {searchQuery && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            {loading ? (
              <div className="gap-6">{renderSkeletonCards()}</div>
            ) : getFilteredUsers().length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="gap-6"
              >
                {getFilteredUsers().map(renderUserCard)}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4 border rounded-lg bg-background"
              >
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-4">
                  <UserCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Not following anyone yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  When you follow other developers, they'll appear here. Discover new developers to follow!
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("discover")}>
                  Discover developers
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            {loading ? (
              <div className="gap-6">{renderSkeletonCards()}</div>
            ) : getFilteredUsers().length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="gap-6"
              >
                {getFilteredUsers().map(renderUserCard)}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4 border rounded-lg bg-background"
              >
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">You're following everyone!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You've followed all the developers in your network. Check back later for new members!
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("following")}>
                  View following
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
