"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Building, MapPin, Calendar, Briefcase, DollarSign, User, CheckCircle, XCircle } from 'lucide-react'
import Link from "next/link"
import VerificationBadge from "@/components/verification-badge"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type Job = {
  _id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  skills: string[]
  type: string
  salary: {
    min: number | null
    max: number | null
    currency: string
  }
  postedBy: {
    _id: string
    name: string
    username: string
    profilePic?: string
    verified?: boolean
  }
  companyLogo?: string
  status: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  remoteOption: string
  experienceLevel: string
  hasApplied?: boolean
}

export default function JobDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    if (!jobId) return
    
    const fetchJobDetails = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}`)
        if (!res.ok) throw new Error("Failed to fetch job details")
        
        const data = await res.json()
        setJob(data)
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobDetails()
  }, [jobId])
  
  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cover letter",
        variant: "destructive",
      })
      return
    }
    
    setApplying(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter,
          resume: resumeUrl || undefined,
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to apply")
      }
      
      toast({
        title: "Success",
        description: "Your application has been submitted",
      })
      
      // Update job in state with hasApplied flag
      setJob((prev) => prev ? { ...prev, hasApplied: true } : null)
      setShowApplyDialog(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }
  
  const formatSalary = (job: Job) => {
    if (!job.salary.min && !job.salary.max) return "Not specified"
    
    const currency = job.salary.currency || "USD"
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    
    if (job.salary.min && job.salary.max) {
      return `${formatter.format(job.salary.min)} - ${formatter.format(job.salary.max)}`
    } else if (job.salary.min) {
      return `From ${formatter.format(job.salary.min)}`
    } else if (job.salary.max) {
      return `Up to ${formatter.format(job.salary.max)}`
    }
    
    return "Not specified"
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className="container py-8">
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold">Job Not Found</h1>
          <p className="text-muted-foreground mt-2">This job posting may have been removed or is no longer available.</p>
          <Button className="mt-4" asChild>
            <Link href="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-wrap md:flex-nowrap gap-6">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4" /> {job.company} 
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground mx-1"></span>
                    <MapPin className="h-4 w-4" /> {job.location}
                  </CardDescription>
                </div>
                {job.companyLogo && (
                  <div className="h-16 w-16 rounded overflow-hidden border">
                    <img src={job.companyLogo || "/placeholder.svg"} alt={`${job.company} logo`} className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
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
                <Badge variant="outline" className="flex items-center gap-1">
                  {job.experienceLevel} Level
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> {formatSalary(job)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </span>
                
                {job.status === "active" ? (
                  job.hasApplied ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1 px-3 py-1.5">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                      <DialogTrigger asChild>
                        <Button>Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                          <DialogDescription>
                            Submit your application to {job.company} for this position.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="cover-letter">Cover Letter</Label>
                            <Textarea
                              id="cover-letter"
                              placeholder="Introduce yourself and explain why you're a good fit for this position..."
                              className="min-h-[150px]"
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="resume">Resume URL (Optional)</Label>
                            <Input
                              id="resume"
                              placeholder="https://example.com/my-resume.pdf"
                              value={resumeUrl}
                              onChange={(e) => setResumeUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Provide a link to your resume or portfolio (Google Drive, Dropbox, etc.)
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleApply} 
                            disabled={applying}
                          >
                            {applying ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                              </>
                            ) : (
                              "Submit Application"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1.5">
                    <XCircle className="h-4 w-4 mr-1" />
                    {job.status === "filled" ? "Position Filled" : "No Longer Active"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-2">Job Description</h2>
                  <div className="space-y-3 text-sm">
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Requirements</h2>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {job.postedBy && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Posted by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={job.postedBy.profilePic || "/placeholder.svg"} alt={job.postedBy.name} />
                    <AvatarFallback>
                      {job.postedBy.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      {job.postedBy.name}
                      {job.postedBy.verified && <VerificationBadge size="sm" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{job.postedBy.username}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" asChild>
                    <Link href={`/profile/${job.postedBy._id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Company</span>
                    <p className="text-sm">{job.company}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Location</span>
                    <p className="text-sm">{job.location}</p>
                    <p className="text-sm text-muted-foreground">{job.remoteOption}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Job Type</span>
                    <p className="text-sm">{job.type}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Experience Level</span>
                    <p className="text-sm">{job.experienceLevel}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Salary</span>
                    <p className="text-sm">{formatSalary(job)}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Posted</span>
                    <p className="text-sm">{format(new Date(job.createdAt), "MMMM d, yyyy")}</p>
                  </dd>
                </div>
                
                <div className="flex items-start gap-2">
                  <dt className="w-8 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </dt>
                  <dd>
                    <span className="font-medium">Expires</span>
                    <p className="text-sm">{format(new Date(job.expiresAt), "MMMM d, yyyy")}</p>
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="flex flex-col">
              {job.status === "active" && !job.hasApplied && (
                <Button 
                  className="w-full" 
                  onClick={() => setShowApplyDialog(true)}
                >
                  Apply Now
                </Button>
              )}
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Similar jobs could be added here */}
        </div>
      </div>
    </div>
  )
}
