"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PostJobPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [jobType, setJobType] = useState("")
  const [remoteOption, setRemoteOption] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [salaryCurrency, setSalaryCurrency] = useState("USD")
  const { toast } = useToast()

  // Skills and requirements
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [requirementInput, setRequirementInput] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleAddRequirement = () => {
    const trimmedRequirement = requirementInput.trim()
    if (trimmedRequirement) {
      setRequirements([...requirements, trimmedRequirement])
      setRequirementInput("")
    }
  }

  const handleRemoveRequirement = (reqToRemove: string) => {
    setRequirements(requirements.filter((req) => req !== reqToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!title || !company || !location || !description || !jobType || !remoteOption || !experienceLevel) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const jobData = {
        title,
        company,
        location,
        description,
        requirements,
        skills,
        type: jobType,
        remoteOption,
        experienceLevel,
        companyLogo: companyLogo || undefined,
        salary: {
          min: salaryMin ? Number(salaryMin) : null,
          max: salaryMax ? Number(salaryMax) : null,
          currency: salaryCurrency,
        },
      }

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to create job posting")
      }

      const newJob = await res.json()

      toast({
        title: "Success",
        description: "Job posting created successfully",
      })

      // Redirect to the new job posting
      router.push(`/jobs/${newJob._id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Post a Job</h1>
          <p className="text-muted-foreground">Create a new job listing to find the perfect candidate</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Job Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Basic information about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior Frontend Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="company"
                      placeholder="e.g. Acme Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Company Logo URL (Optional)</Label>
                    <Input
                      id="companyLogo"
                      placeholder="https://example.com/logo.png"
                      value={companyLogo}
                      onChange={(e) => setCompanyLogo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type <span className="text-red-500">*</span></Label>
                    <Select value={jobType} onValueChange={setJobType} required>
                      <SelectTrigger id="jobType">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remoteOption">Work Location <span className="text-red-500">*</span></Label>
                    <Select value={remoteOption} onValueChange={setRemoteOption} required>
                      <SelectTrigger id="remoteOption">
                        <SelectValue placeholder="Select work location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level <span className="text-red-500">*</span></Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel} required>
                      <SelectTrigger id="experienceLevel">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead">Lead/Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and ideal candidate..."
                    className="min-h-[200px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>Compensation details for the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary (Optional)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g. 50000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary (Optional)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 80000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary (Optional)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 80000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">Currency</Label>
                <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                  <SelectTrigger id="salaryCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="NG">NG - Nigerian Naira</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Skills and Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Skills and Requirements</CardTitle>
              <CardDescription>Add skills and requirements for the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g. React, Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a requirement"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddRequirement()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequirement} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {requirements.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm">{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req)}
                          className="hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/jobs">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting Job
                      </>
                    ) : (
                      "Post Job"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
