"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type VerificationRequest = {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    profilePic?: string
    email: string
  }
  status: "pending" | "approved" | "rejected"
  documentUrl?: string
  reason: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminVerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
      const { toast } = useToast()

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/home")
      return
    }

    const fetchVerificationRequests = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verification/admin/requests`)
        if (!res.ok) throw new Error("Failed to fetch verification requests")

        const data = await res.json()
        setRequests(data)
      } catch (error) {
        console.error("Error fetching verification requests:", error)
        toast({
          title: "Error",
          description: "Failed to load verification requests",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVerificationRequests()
  }, [user, router])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verification/admin/approve/${id}`, {
        method: "PUT",
      })

      if (!res.ok) throw new Error("Failed to approve verification request")

      // Update the request status in the UI
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status: "approved" } : req)))

      toast({
        title: "Success",
        description: "Verification request approved",
      })
    } catch (error) {
      console.error("Error approving verification request:", error)
      toast({
        title: "Error",
        description: "Failed to approve verification request",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verification/admin/reject/${id}`, {
        method: "PUT",
      })

      if (!res.ok) throw new Error("Failed to reject verification request")

      // Update the request status in the UI
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status: "rejected" } : req)))

      toast({
        title: "Success",
        description: "Verification request rejected",
      })
    } catch (error) {
      console.error("Error rejecting verification request:", error)
      toast({
        title: "Error",
        description: "Failed to reject verification request",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatRequestTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const filteredRequests = requests.filter((req) => req.status === activeTab)

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Verification Requests</h1>
          <p className="text-muted-foreground">Manage user verification requests</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
            <Badge variant="secondary" className="ml-1">
              {requests.filter((req) => req.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.user.profilePic || "/placeholder.svg"} alt={request.user.name} />
                        <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.user.name}</CardTitle>
                        <CardDescription>@{request.user.username}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "outline"
                          : request.status === "approved"
                            ? "success"
                            : "destructive"
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Reason for verification:</h4>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                  {request.documentUrl && (
                    <div>
                      <h4 className="text-sm font-medium">Supporting document:</h4>
                      <a
                        href={request.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View document
                      </a>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium">Submitted:</h4>
                    <p className="text-sm text-muted-foreground">{formatRequestTime(request.createdAt)}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${request.user._id}`}>View Profile</Link>
                  </Button>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(request._id)}
                        disabled={processingId === request._id}
                      >
                        {processingId === request._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(request._id)}
                        disabled={processingId === request._id}
                      >
                        {processingId === request._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">No {activeTab} requests</h3>
            <p className="text-muted-foreground mt-2">
              {activeTab === "pending"
                ? "There are no pending verification requests to review."
                : activeTab === "approved"
                  ? "No verification requests have been approved yet."
                  : "No verification requests have been rejected yet."}
            </p>
          </div>
        )}
      </Tabs>
    </div>
  )
}
