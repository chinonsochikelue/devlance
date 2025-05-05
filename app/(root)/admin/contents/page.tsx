"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as ReChartsPieChart,
  Pie,
  Cell,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

// Define types
type ModerationItem = {
  _id: string
  content: string
  contentText: string
  contentModel: string
  flaggedBy: {
    _id: string
    name: string
    username: string
  }
  contentOwner: {
    _id: string
    name: string
    username: string
    profilePic?: string
  }
  flaggedReason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  aiScore?: number
  aiCategories?: {
    sexual: number
    harassment: number
    hate: number
    violence: number
    selfHarm: number
    spam: number
  }
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
  recentActivity: Array<any>
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function ContentModerationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([])
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [moderationNote, setModerationNote] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("7") // Default to 7 days

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/feed")
      return
    }

    fetchModerationQueue()
    fetchModerationStats()
  }, [user, router, currentPage, currentStatus])

  const fetchModerationQueue = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/queue?status=${currentStatus}&page=${currentPage}`)
      if (!res.ok) throw new Error("Failed to fetch moderation queue")

      const data = await res.json()
      setModerationItems(data.items)
      setTotalPages(data.pages)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching moderation queue:", error)
      toast({
        title: "Error",
        description: "Failed to load moderation queue",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const fetchModerationStats = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/stats`)
      if (!res.ok) throw new Error("Failed to fetch moderation stats")

      const data = await res.json()
      setModerationStats(data)
    } catch (error) {
      console.error("Error fetching moderation stats:", error)
    }
  }

  const handleModerateContent = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/moderation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: moderationNote,
        }),
      })

      if (!res.ok) throw new Error("Failed to moderate content")

      toast({
        title: "Success",
        description: `Content ${status === "approved" ? "approved" : "rejected"} successfully`,
      })

      // Refresh the queue and stats
      fetchModerationQueue()
      fetchModerationStats()
      setModerationNote("")
    } catch (error) {
      console.error("Error moderating content:", error)
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  // Prepare data for charts
  const prepareStatusChartData = () => {
    if (!moderationStats) return []
    return [
      { name: "Pending", value: moderationStats.statusStats.pending },
      { name: "Approved", value: moderationStats.statusStats.approved },
      { name: "Rejected", value: moderationStats.statusStats.rejected },
    ]
  }

  const prepareContentTypeChartData = () => {
    if (!moderationStats) return []
    return [
      { name: "Posts", value: moderationStats.contentStats.ping },
      { name: "Messages", value: moderationStats.contentStats.message },
    ]
  }

  const prepareReasonChartData = () => {
    if (!moderationStats) return []
    return Object.entries(moderationStats.reasonStats).map(([reason, count]) => ({
      name: reason.replace("_", " "),
      value: count,
    }))
  }

  // Generate AI category chart data for a specific moderation item
  const generateAICategoryData = (item: ModerationItem) => {
    if (!item.aiCategories) return []
    return [
      { name: "Sexual", value: item.aiCategories.sexual * 100 },
      { name: "Harassment", value: item.aiCategories.harassment * 100 },
      { name: "Hate", value: item.aiCategories.hate * 100 },
      { name: "Violence", value: item.aiCategories.violence * 100 },
      { name: "Self-Harm", value: item.aiCategories.selfHarm * 100 },
      { name: "Spam", value: item.aiCategories.spam * 100 },
    ]
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

      <Tabs defaultValue="queue">
        <TabsList className="mb-6">
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="stats">Moderation Stats</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger
                value="pending"
                onClick={() => setCurrentStatus("pending")}
                className={currentStatus === "pending" ? "bg-primary text-primary-foreground" : ""}
              >
                Pending
                {moderationStats && (
                  <Badge variant="outline" className="ml-2">
                    {moderationStats.statusStats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                onClick={() => setCurrentStatus("approved")}
                className={currentStatus === "approved" ? "bg-primary text-primary-foreground" : ""}
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                onClick={() => setCurrentStatus("rejected")}
                className={currentStatus === "rejected" ? "bg-primary text-primary-foreground" : ""}
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : moderationItems.length > 0 ? (
            <div className="space-y-6">
              {moderationItems.map((item) => (
                <Card key={item._id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.contentModel === "Ping" ? "default" : "secondary"}>
                          {item.contentModel === "Ping" ? "Post" : "Message"}
                        </Badge>
                        <Badge variant="outline">{item.flaggedReason.replace("_", " ")}</Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
                      </div>
                      {item.aiScore && (
                        <Badge variant={item.aiScore > 0.7 ? "destructive" : "outline"}>
                          AI Score: {(item.aiScore * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={item.contentOwner.profilePic || "/placeholder.svg"}
                              alt={item.contentOwner.name}
                            />
                            <AvatarFallback>
                              {item.contentOwner.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.contentOwner.name}</p>
                            <p className="text-xs text-muted-foreground">@{item.contentOwner.username}</p>
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="whitespace-pre-wrap">{item.contentText}</p>
                        </div>
                      </div>

                      {item.aiCategories && (
                        <div className="w-64 h-64">
                          <p className="text-sm font-medium mb-2">AI Category Analysis</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={generateAICategoryData(item)} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" width={80} />
                              <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                              <Bar
                                dataKey="value"
                                fill="#8884d8"
                                background={{ fill: "#eee" }}
                                barSize={20}
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Flagged by: {item.flaggedBy ? item.flaggedBy.name : "System"}
                      </p>
                    </div>

                    {currentStatus === "pending" && (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add moderation notes (optional)"
                          value={moderationNote}
                          onChange={(e) => setModerationNote(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleModerateContent(item._id, "approved")}
                            disabled={processingId === item._id}
                            className="flex-1"
                          >
                            {processingId === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleModerateContent(item._id, "rejected")}
                            disabled={processingId === item._id}
                            className="flex-1"
                          >
                            {processingId === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-medium">No items to moderate</p>
              <p className="text-muted-foreground">All content has been reviewed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          {moderationStats ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Status Overview</CardTitle>
                  <CardDescription>Current moderation queue status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        Pending
                      </span>
                      <Badge variant="outline">{moderationStats.statusStats.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Approved
                      </span>
                      <Badge variant="outline">{moderationStats.statusStats.approved}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Rejected
                      </span>
                      <Badge variant="outline">{moderationStats.statusStats.rejected}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <Badge>{moderationStats.statusStats.total}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Types</CardTitle>
                  <CardDescription>Distribution by content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Posts</span>
                      <Badge variant="outline">{moderationStats.contentStats.ping}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Messages</span>
                      <Badge variant="outline">{moderationStats.contentStats.message}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Flag Reasons</CardTitle>
                  <CardDescription>Why content was flagged</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(moderationStats.reasonStats).map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <span>{reason.replace("_", " ")}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="charts">
          {moderationStats ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Status Distribution</CardTitle>
                  <CardDescription>Breakdown of content by moderation status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                      <Pie
                        data={prepareStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
                      <Legend />
                    </ReChartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                  <CardDescription>Breakdown of flagged content by type</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                      <Pie
                        data={prepareContentTypeChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareContentTypeChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
                      <Legend />
                    </ReChartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Flag Reasons Distribution</CardTitle>
                  <CardDescription>Breakdown of content by flag reason</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareReasonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
