"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Users, FileCheck, Bell, BarChart } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type AdminStats = {
  totalUsers: number
  newUsersToday: number
  totalVerificationRequests: number
  pendingVerificationRequests: number
  totalPosts: number
  postsToday: number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const {toast} = useToast()

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push("/home")
      return
    }

    const fetchAdminStats = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/stats`)
        if (!res.ok) throw new Error("Failed to fetch admin stats")

        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        toast({
          title: "Error",
          description: "Failed to load admin statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [user, router])

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the DevConnect platform</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-medium">Admin Access</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.newUsersToday} new today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVerificationRequests}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingVerificationRequests} pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">{stats.postsToday} new today</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium">Failed to load statistics</h3>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Review and manage verification requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/admin/verification">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Verification Requests
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>Moderate posts and comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/admin/contents">
                  <Bell className="mr-2 h-4 w-4" />
                  Moderate Content
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View detailed platform analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/admin/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
