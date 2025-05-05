"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Building, MapPin, Briefcase, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type JobApplication = {
  _id: string
  job: {
    _id: string
    title: string
    company: string
    location: string
    type: string
    remoteOption: string
    companyLogo?: string
    postedBy: {
      name: string
      username: string
      profilePic?: string
      verified?: boolean
    }
  }
  status: string
  coverLetter: string
  resume?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "reviewed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "interview":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending"
    case "reviewed":
      return "Reviewed"
    case "interview":
      return "Interview"
    case "accepted":
      return "Accepted"
    case "rejected":
      return "Rejected"
    default:
      return status
  }
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/applications/me`)
        if (!res.ok) throw new Error("Failed to fetch applications")

        const data = await res.json()
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load your applications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const filteredApplications =
    activeTab === "all" ? applications : applications.filter((app) => app.status === activeTab)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications</p>
        </div>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {applications.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground mt-2">You haven't applied to any jobs yet</p>
              <Button className="mt-4" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({applications.filter((app) => app.status === "pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="reviewed">
                    Reviewed ({applications.filter((app) => app.status === "reviewed").length})
                  </TabsTrigger>
                  <TabsTrigger value="interview">
                    Interview ({applications.filter((app) => app.status === "interview").length})
                  </TabsTrigger>
                  <TabsTrigger value="accepted">
                    Accepted ({applications.filter((app) => app.status === "accepted").length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({applications.filter((app) => app.status === "rejected").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  {filteredApplications.length === 0 ? (
                    <div className="bg-muted/50 rounded-lg p-6 text-center">
                      <p className="text-muted-foreground">No applications in this category</p>
                    </div>
                  ) : (
                    filteredApplications.map((application) => (
                      <Card key={application._id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">
                                <Link href={`/jobs/${application.job._id}`} className="hover:text-primary">
                                  {application.job.title}
                                </Link>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Building className="h-4 w-4" /> {application.job.company}
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground mx-1"></span>
                                <MapPin className="h-4 w-4" /> {application.job.location}
                              </CardDescription>
                            </div>
                            <Badge className={`${getStatusColor(application.status)} px-3 py-1`}>
                              {formatStatus(application.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" /> {application.job.type}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {application.job.remoteOption === "Remote" ? (
                                <>🌐 Remote</>
                              ) : application.job.remoteOption === "Hybrid" ? (
                                <>🏢 Hybrid</>
                              ) : (
                                <>🏢 On-site</>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-1">Your Cover Letter</h3>
                              <div className="bg-muted/50 p-3 rounded-md text-sm">
                                {application.coverLetter.split("\n").map((paragraph, index) => (
                                  <p key={index} className="mb-2 last:mb-0">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            </div>

                            {application.resume && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Your Resume</h3>
                                <a
                                  href={application.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> View Resume
                                </a>
                              </div>
                            )}

                            {application.notes && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Employer Notes</h3>
                                <div className="bg-muted/50 p-3 rounded-md text-sm">{application.notes}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="flex justify-between border-t pt-4">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/jobs/${application.job._id}`}>View Job</Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  )
}
