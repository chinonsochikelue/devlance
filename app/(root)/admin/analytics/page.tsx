"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BarChart, Users, FileText, MessageSquare, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

// Define types for our analytics data
type AnalyticsDashboardData = {
  overview: {
    totalUsers: number
    totalPosts: number
    activeUsers: number
    dailyActiveUsers: number
  }
  dailyAnalytics: Array<{
    date: string
    newUsers: number
    activeUsers: number
    newPosts: number
    newComments: number
    newLikes: number
    newMessages: number
  }>
  topContent: Array<{
    _id: string
    content: {
      _id: string
      text: string
      createdAt: string
      user: {
        name: string
        username: string
        profilePic: string
      }
    }
    views: number
    likes: number
    comments: number
  }>
  userEngagement: {
    avgSessionCount: number
    avgTimeSpent: number
    avgPostsCreated: number
    avgCommentsCreated: number
    avgLikesGiven: number
    avgMessagesExchanged: number
  }
  growth: {
    users: number
    posts: number
    comments: number
    likes: number
    messages: number
  }
}

type UserEngagementData = {
  mostActiveUsers: Array<{
    _id: string
    user: {
      _id: string
      name: string
      username: string
      profilePic: string
    }
    totalTimeSpent: number
    sessionCount: number
  }>
  mostPostsUsers: Array<{
    _id: string
    user: {
      _id: string
      name: string
      username: string
      profilePic: string
    }
    postsCreated: number
  }>
  mostViewedUsers: Array<{
    _id: string
    user: {
      _id: string
      name: string
      username: string
      profilePic: string
    }
    profileViews: number
  }>
  retention: {
    highly_active: number
    active: number
    casual: number
    one_time: number
  }
}

type ContentPerformanceData = {
  mostViewedContent: Array<{
    _id: string
    content: {
      _id: string
      text: string
      createdAt: string
      user: {
        name: string
        username: string
        profilePic: string
      }
    }
    views: number
    uniqueViewers: number
  }>
  mostEngagedContent: Array<{
    _id: string
    content: {
      _id: string
      text: string
      createdAt: string
      user: {
        name: string
        username: string
        profilePic: string
      }
    }
    likes: number
    comments: number
  }>
  highestConversionContent: Array<{
    _id: string
    content: {
      _id: string
      text: string
      createdAt: string
      user: {
        name: string
        username: string
        profilePic: string
      }
    }
    views: number
    likes: number
    clickThroughRate: number
  }>
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AnalyticsDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null)
  const [userEngagementData, setUserEngagementData] = useState<UserEngagementData | null>(null)
  const [contentPerformanceData, setContentPerformanceData] = useState<ContentPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const {toast} = useToast()
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/home")
      return
    }

    const fetchAnalyticsData = async () => {
      setLoading(true)
      try {
        // Fetch dashboard data
        const dashboardRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/dashboard?days=${timeRange}`)
        if (!dashboardRes.ok) throw new Error("Failed to fetch analytics dashboard data")
        const dashboardData = await dashboardRes.json()
        setDashboardData(dashboardData)

        // Fetch user engagement data
        const userEngagementRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/user-engagement`)
        if (!userEngagementRes.ok) throw new Error("Failed to fetch user engagement data")
        const userEngagementData = await userEngagementRes.json()
        setUserEngagementData(userEngagementData)

        // Fetch content performance data
        const contentPerformanceRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/content-performance`)
        if (!contentPerformanceRes.ok) throw new Error("Failed to fetch content performance data")
        const contentPerformanceData = await contentPerformanceRes.json()
        setContentPerformanceData(contentPerformanceData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [user, router, timeRange])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (!user?.isAdmin) {
    return null
  }

  // Prepare retention data for pie chart
  const retentionData = userEngagementData
    ? [
        { name: "Highly Active", value: userEngagementData.retention.highly_active },
        { name: "Active", value: userEngagementData.retention.active },
        { name: "Casual", value: userEngagementData.retention.casual },
        { name: "One Time", value: userEngagementData.retention.one_time },
      ]
    : []

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Detailed insights into platform performance and user engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/generate-daily`, {
                method: "POST",
              })
                .then((res) => {
                  if (res.ok) {
                    toast({
                      title: "Success",
                      description: "Daily analytics generated successfully",
                    })
                  } else {
                    throw new Error("Failed to generate daily analytics")
                  }
                })
                .catch((error) => {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to generate daily analytics",
                    variant: "destructive",
                  })
                })
                .finally(() => setLoading(false))
            }}
          >
            Generate Daily Analytics
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Engagement</TabsTrigger>
            <TabsTrigger value="content">Content Performance</TabsTrigger>
            <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {dashboardData && (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(dashboardData.overview.totalUsers)}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.growth.users > 0 ? "+" : ""}
                        {dashboardData.growth.users.toFixed(1)}% growth
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(dashboardData.overview.activeUsers)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(dashboardData.overview.dailyActiveUsers)} daily active
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(dashboardData.overview.totalPosts)}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.growth.posts > 0 ? "+" : ""}
                        {dashboardData.growth.posts.toFixed(1)}% growth
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.userEngagement.avgLikesGiven
                          ? (
                              (dashboardData.userEngagement.avgLikesGiven /
                                dashboardData.userEngagement.avgPostsCreated) *
                              100
                            ).toFixed(1) + "%"
                          : "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground">Avg. likes per post</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>Daily active users and new registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dashboardData.dailyAnalytics.map((item) => ({
                            date: formatDate(item.date),
                            activeUsers: item.activeUsers,
                            newUsers: item.newUsers,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                          <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" name="New Users" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Activity</CardTitle>
                    <CardDescription>Daily posts, comments, and likes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dashboardData.dailyAnalytics.map((item) => ({
                            date: formatDate(item.date),
                            posts: item.newPosts,
                            comments: item.newComments,
                            likes: item.newLikes,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="posts" stroke="#8884d8" name="Posts" />
                          <Line type="monotone" dataKey="comments" stroke="#82ca9d" name="Comments" />
                          <Line type="monotone" dataKey="likes" stroke="#ffc658" name="Likes" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {userEngagementData && (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Retention</CardTitle>
                      <CardDescription>Breakdown of user activity levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={retentionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {retentionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Active Users</CardTitle>
                      <CardDescription>Users with highest time spent on platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userEngagementData.mostActiveUsers.slice(0, 5).map((item) => (
                          <div key={item._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img
                                  src={item.user.profilePic || "/placeholder.svg?height=32&width=32"}
                                  alt={item.user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.user.name}</p>
                                <p className="text-xs text-muted-foreground">@{item.user.username}</p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {formatTime(item.totalTimeSpent)}
                              <span className="text-xs text-muted-foreground ml-1">({item.sessionCount} sessions)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Content Creators</CardTitle>
                      <CardDescription>Users who create the most posts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userEngagementData.mostPostsUsers.slice(0, 5).map((item) => (
                          <div key={item._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img
                                  src={item.user.profilePic || "/placeholder.svg?height=32&width=32"}
                                  alt={item.user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.user.name}</p>
                                <p className="text-xs text-muted-foreground">@{item.user.username}</p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">{formatNumber(item.postsCreated)} posts</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Viewed Profiles</CardTitle>
                      <CardDescription>Users with the most profile views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userEngagementData.mostViewedUsers.slice(0, 5).map((item) => (
                          <div key={item._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img
                                  src={item.user.profilePic || "/placeholder.svg?height=32&width=32"}
                                  alt={item.user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.user.name}</p>
                                <p className="text-xs text-muted-foreground">@{item.user.username}</p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">{formatNumber(item.profileViews)} views</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {contentPerformanceData && (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Viewed Content</CardTitle>
                      <CardDescription>Posts with the highest view counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contentPerformanceData.mostViewedContent.slice(0, 5).map((item) => (
                          <div key={item._id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full overflow-hidden">
                                <img
                                  src={item.content.user.profilePic || "/placeholder.svg?height=24&width=24"}
                                  alt={item.content.user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <p className="text-sm font-medium">{item.content.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.content.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm line-clamp-2">{item.content.text}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatNumber(item.views)} views</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Engaged Content</CardTitle>
                      <CardDescription>Posts with the most likes and comments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contentPerformanceData.mostEngagedContent.slice(0, 5).map((item) => (
                          <div key={item._id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full overflow-hidden">
                                <img
                                  src={item.content.user.profilePic || "/placeholder.svg?height=24&width=24"}
                                  alt={item.content.user.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <p className="text-sm font-medium">{item.content.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.content.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm line-clamp-2">{item.content.text}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatNumber(item.likes)} likes</span>
                              <span>{formatNumber(item.comments)} comments</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Engagement Metrics</CardTitle>
                    <CardDescription>Comparison of views, likes, and comments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={contentPerformanceData.mostViewedContent.slice(0, 10).map((item) => ({
                            name: item.content.text.substring(0, 20) + "...",
                            views: item.views,
                            likes: item.content.likes || 0,
                            comments: item.content.comments || 0,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" fill="#8884d8" name="Views" />
                          <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                          <Bar dataKey="comments" fill="#ffc658" name="Comments" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            {dashboardData && (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.growth.users > 0 ? "+" : ""}
                        {dashboardData.growth.users.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compared to previous period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Content Growth</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.growth.posts > 0 ? "+" : ""}
                        {dashboardData.growth.posts.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compared to previous period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Engagement Growth</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.growth.likes > 0 ? "+" : ""}
                        {dashboardData.growth.likes.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Likes compared to previous period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Messaging Growth</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.growth.messages > 0 ? "+" : ""}
                        {dashboardData.growth.messages.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compared to previous period</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                    <CardDescription>Comparison of key growth metrics over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dashboardData.dailyAnalytics.map((item) => ({
                            date: formatDate(item.date),
                            users: item.newUsers,
                            posts: item.newPosts,
                            engagement: item.newLikes + item.newComments,
                            messages: item.newMessages,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" />
                          <Line type="monotone" dataKey="posts" stroke="#82ca9d" name="New Posts" />
                          <Line type="monotone" dataKey="engagement" stroke="#ffc658" name="Engagement" />
                          <Line type="monotone" dataKey="messages" stroke="#ff8042" name="Messages" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
