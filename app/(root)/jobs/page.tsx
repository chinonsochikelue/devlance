"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Loader2, Search, Plus } from "lucide-react"
import JobCard from "@/components/job/job-card"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  type: string
  salary?: string
  createdAt: string
  applicationsCount?: number
}

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [jobType, setJobType] = useState(searchParams.get("type") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  // Pagination
  const currentPage = Number.parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query string from search params
      const queryParams = new URLSearchParams()
      if (searchParams.get("q")) queryParams.append("q", searchParams.get("q") || "")
      if (searchParams.get("type")) queryParams.append("type", searchParams.get("type") || "")
      if (searchParams.get("location")) queryParams.append("location", searchParams.get("location") || "")
      if (searchParams.get("page")) queryParams.append("page", searchParams.get("page") || "1")

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()
      setJobs(data.jobs)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError("Failed to load jobs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build query params
    const params = new URLSearchParams()
    if (searchQuery) params.append("q", searchQuery)
    if (jobType) params.append("type", jobType)
    if (location) params.append("location", location)
    params.append("page", "1") // Reset to first page on new search

    router.push(`/jobs?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <Button onClick={() => router.push("/jobs/post")}>
          <Plus className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

          <Button type="submit">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchJobs} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search filters or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
