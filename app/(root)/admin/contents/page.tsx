"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Pagination } from "@/components/ui/pagination"
import { Loader2, CheckCircle, XCircle, Flag, MessageSquare, FileText } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type ModerationItem = {
  _id: string
  content: string
  contentModel: "Ping" | "Message"
  contentText: string
  flaggedBy: {
    _id: string
    name: string
    username: string
  } | null
  flaggedReason: string
  aiScore: number
  aiCategories: {
    sexual: number
    harassment: number
    hate: number
    violence: number
    selfHarm: number
    spam: number
  }
  status: "pending" | "approved" | "rejected"
  contentOwner: {
    _id: string
    name: string
    username: string
    profilePic: string
  }
  createdAt: string
}

type ModerationStats = {
  statusStats: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
  contentStats: {
    ping: number
    message: number
  }
  reasonStats: {
    [key: string]: number
  }
  recentActivity: Array<{
    _id: string
    status: string
    contentModel: string
    updatedAt: string
    contentOwner: {
      name: string
      username: string
    }
    moderatedBy: {
      name: string
      username: string
    }
  }>
}

export default function ContentModerationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [totalPages, setTotalPages] = useState(1)
  const [moderationNotes, setModerationNotes] = useState("")
  const [processingIds, setProcessingIds] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push("/home")
      return
    }

    const fetchModerationData = async () => {
      setLoading(true)
      try {
        // Fetch moderation queue
        const queueRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/queue?status=${currentStatus}&page=${page}`)
        if (!queueRes.ok) throw new Error("Failed to fetch moderation queue")
        const queueData = await queueRes.json()
        setModerationItems(queueData.items)
        setTotalPages(queueData.pages)

        // Fetch moderation stats
        const statsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/stats`)
        if (!statsRes.ok) throw new Error("Failed to fetch moderation stats")
        const statsData = await statsRes.json()
        setStats(statsData)
      } catch (error) {
        console.error("Error fetching moderation data:", error)
        toast({
          title: "Error",
          description: "Failed to load moderation data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchModerationData()
  }, [user, router, currentStatus, page])

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    setProcessingIds((prev) => [...prev, id])
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: moderationNotes,
        }),
      })

      if (!res.ok) throw new Error("Failed to moderate content")

      // Remove the moderated item from the list
      setModerationItems((prev) => prev.filter((item) => item._id !== id))

      // Update stats
      if (stats) {
        const newStats = { ...stats }
        newStats.statusStats[currentStatus] -= 1
        newStats.statusStats[status] += 1
        setStats(newStats)
      }

      toast({
        title: "Success",
        description: `Content has been ${status === "approved" ? "approved" : "rejected"}`,
      })

      // Reset moderation notes
      setModerationNotes("")
    } catch (error) {
      console.error("Error moderating content:", error)
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  const formatReason = (reason: string) => {
    return reason.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate flagged content</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Stats</CardTitle>
              <CardDescription>Overview of moderation activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-amber-500 font-bold text-xl">{stats.statusStats.pending}</span>
                        <span className="text-xs">Pending</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-green-500 font-bold text-xl">{stats.statusStats.approved}</span>
                        <span className="text-xs">Approved</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-red-500 font-bold text-xl">{stats.statusStats.rejected}</span>
                        <span className="text-xs">Rejected</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Content Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="font-bold text-xl">{stats.contentStats.ping}</span>
                        <span className="text-xs">Posts</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="font-bold text-xl">{stats.contentStats.message}</span>
                        <span className="text-xs">Messages</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Flag Reasons</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.reasonStats).map(([reason, count]) => (
                        <div key={reason} className="flex justify-between items-center">
                          <span className="text-sm">{formatReason(reason)}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {stats.recentActivity.map((activity) => (
                        <div key={activity._id} className="text-xs p-2 bg-muted rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{activity.contentOwner.name}</span>
                            <Badge
                              variant={activity.status === "approved" ? "outline" : "destructive"}
                              className="text-[10px] h-4"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {activity.contentModel} moderated by {activity.moderatedBy?.name || "System"}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {format(new Date(activity.updatedAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <Tabs
                defaultValue="pending"
                className="w-full"
                onValueChange={(value) => {
                  setCurrentStatus(value as "pending" | "approved" | "rejected")
                  setPage(1)
                }}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending
                    {stats && (
                      <Badge variant="outline" className="ml-2">
                        {stats.statusStats.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved
                    {stats && (
                      <Badge variant="outline" className="ml-2">
                        {stats.statusStats.approved}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected
                    {stats && (
                      <Badge variant="outline" className="ml-2">
                        {stats.statusStats.rejected}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : moderationItems.length > 0 ? (
                <div className="space-y-6">
                  {moderationItems.map((item) => (
                    <Card key={item._id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                              <img
                                src={item.contentOwner.profilePic || "/placeholder.svg?height=32&width=32"}
                                alt={item.contentOwner.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.contentOwner.name}</p>
                              <p className="text-xs text-muted-foreground">@{item.contentOwner.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.contentModel === "Ping" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge variant="outline">{formatReason(item.flaggedReason)}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-4">
                          <p className="whitespace-pre-wrap">{item.contentText}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>

                        {item.aiScore > 0 && (
                          <div className="mb-4 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-2">AI Moderation Results</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {Object.entries(item.aiCategories).map(([category, score]) => (
                                <div key={category} className="flex flex-col">
                                  <span>{formatReason(category)}</span>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-red-500 h-1.5 rounded-full"
                                      style={{ width: `${score * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Moderation Notes</p>
                          <Textarea
                            placeholder="Add notes about this moderation decision..."
                            value={moderationNotes}
                            onChange={(e) => setModerationNotes(e.target.value)}
                            className="resize-none"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t bg-muted/50 p-2">
                        <div className="text-xs text-muted-foreground">
                          {item.flaggedBy ? (
                            <span>Flagged by {item.flaggedBy.name}</span>
                          ) : (
                            <span>Flagged by system</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleModerate(item._id, "approved")}
                            disabled={processingIds.includes(item._id)}
                          >
                            {processingIds.includes(item._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleModerate(item._id, "rejected")}
                            disabled={processingIds.includes(item._id)}
                          >
                            {processingIds.includes(item._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <Flag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No items to moderate</h3>
                  <p className="text-muted-foreground mt-2">
                    There are no {currentStatus} items in the moderation queue
                  </p>
                </div>
              )}
            </CardContent>
            {totalPages > 1 && (
              <CardFooter className="flex justify-center border-t p-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
