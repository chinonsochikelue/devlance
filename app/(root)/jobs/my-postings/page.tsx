"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Building, MapPin, Calendar, Briefcase, MoreVertical, Users, Clock, AlertTriangle } from 'lucide-react'
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type Job = {
  _id: string
  title: string
  company: string
  location: string
  description: string
  type: string
  remoteOption: string
  experienceLevel: string
  companyLogo?: string
  status: string
  createdAt: string
  expiresAt: string
  applicantCount: number
}

export default function MyPostingsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [jobToUpdate, setJobToUpdate] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const {toast} = useToast()
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/posted/me`)
        if (!res.ok) throw new Error("Failed to fetch jobs")
        
        const data = await res.json()
        setJobs(data)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load your job postings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [])
  
  const filteredJobs = activeTab === "all" 
    ? jobs 
    : jobs.filter(job => job.status === activeTab)
  
  const handleUpdateStatus = async () => {
    if (!jobToUpdate || !newStatus) return
    
    setIsUpdating(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) throw new Error("Failed to update job status")
      
      // Update job in state
      setJobs(jobs.map(job => 
        job._id === jobToUpdate ? { ...job, status: newStatus } : job
      ))
      
      toast({
        title: "Success",
        description: "Job status updated successfully",
      })
      
      setJobToUpdate(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    
    setIsDeleting(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobToDelete}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete job")
      
      // Remove job from state
      setJobs(jobs.filter(job => job._id !== jobToDelete))
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      
      setJobToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings and applications</p>
        </div>
        <Button asChild>
          <Link href="/jobs/post">Post New Job</Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {jobs.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium">No job postings yet</h3>
              <p className="text-muted-foreground mt-2">You haven't posted any jobs yet</p>
              <Button className="mt-4" asChild>
                <Link href="/jobs/post">Post Your First Job</Link>
              </Button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({jobs.filter(job => job.status === "active").length})
                  </TabsTrigger>
                  <TabsTrigger value="filled">
                    Filled ({jobs.filter(job => job.status === "filled").length})
                  </TabsTrigger>
                  <TabsTrigger value="expired">
                    Expired ({jobs.filter(job => job.status === "expired").length})
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    Draft ({jobs.filter(job => job.status === "draft").length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="bg-muted/50 rounded-lg p-6 text-center">
                      <p className="text-muted-foreground">No job postings in this category</p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <Card key={job._id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">
                                <Link href={`/jobs/${job._id}`} className="hover:text-primary">
                                  {job.title}
                                </Link>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Building className="h-4 w-4" /> {job.company}
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground mx-1"></span>
                                <MapPin className="h-4 w-4" /> {job.location}
                              </CardDescription>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}`)}>
                                  View Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}/applications`)}>
                                  View Applications
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/jobs/${job._id}/edit`)}>
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setJobToUpdate(job._id)
                                    setNewStatus(job.status)
                                  }}
                                >
                                  Change Status
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setJobToDelete(job._id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge 
                              variant={job.status === "active" ? "default" : "outline"}
                              className={job.status === "expired" ? "text-destructive" : ""}
                            >
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" /> {job.type}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {job.remoteOption === 'Remote' ? (
                                <>🌐 Remote</>
                              ) : job.remoteOption === 'Hybrid' ? (
                                <>🏢 Hybrid</>
                              ) : (
                                <>🏢 On-site</>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <Separator />
                        
                        <CardContent className="pt-4">
                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{job.applicantCount}</div>
                                <div className="text-xs text-muted-foreground">Applicants</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{format(new Date(job.createdAt), "MMM d, yyyy")}</div>
                                <div className="text-xs text-muted-foreground">Posted Date</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{format(new Date(job.expiresAt), "MMM d, yyyy")}</div>
                                <div className="text-xs text-muted-foreground">Expires</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between border-t pt-4">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/jobs/${job._id}`}>
                                View Job
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/jobs/${job._id}/applications`}>
                                View Applications
                              </Link>
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
      
      {/* Status Update Dialog */}
      <Dialog open={!!jobToUpdate} onOpenChange={(open) => !open && setJobToUpdate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Change the status of this job posting
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobToUpdate(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>This will also delete all applications for this job.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
