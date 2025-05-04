"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search, Filter, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type User = {
  _id: string
  name: string
  username: string
  profilePic?: string
  bio?: string
  role?: string
  location?: string
  skills?: { name: string; level: string }[]
  languages?: { name: string; level: string }[]
  available?: boolean
  hourlyRate?: number
  verified?: boolean
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const {toast} = useToast()
  const [totalPages, setTotalPages] = useState(1)

  // Filter state
  const [filters, setFilters] = useState({
    skills: searchParams.get("skills") || "",
    languages: searchParams.get("languages") || "",
    location: searchParams.get("location") || "",
    role: searchParams.get("role") || "",
    available: searchParams.get("available") === "true",
    minHourlyRate: searchParams.get("minHourlyRate") || "0",
    maxHourlyRate: searchParams.get("maxHourlyRate") || "200",
  })

  // Common roles for select dropdown
  const commonRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "QA Engineer",
    "Technical Writer",
  ]

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Handle filter changes
  const handleFilterChange = (name: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Handle hourly rate slider change
  const handleRateChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minHourlyRate: value[0].toString(),
      maxHourlyRate: value[1].toString(),
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      skills: "",
      languages: "",
      location: "",
      role: "",
      available: false,
      minHourlyRate: "0",
      maxHourlyRate: "200",
    })
  }

  // Apply filters and search
  const applySearch = () => {
    setPage(1)
    fetchUsers()

    // Update URL with search params
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (filters.skills) params.set("skills", filters.skills)
    if (filters.languages) params.set("languages", filters.languages)
    if (filters.location) params.set("location", filters.location)
    if (filters.role) params.set("role", filters.role)
    if (filters.available) params.set("available", "true")
    if (filters.minHourlyRate !== "0") params.set("minHourlyRate", filters.minHourlyRate)
    if (filters.maxHourlyRate !== "200") params.set("maxHourlyRate", filters.maxHourlyRate)

    const url = `/search${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url, { scroll: false })
  }

  // Fetch users based on search and filters
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set("query", query)
      if (filters.skills) params.set("skills", filters.skills)
      if (filters.languages) params.set("languages", filters.languages)
      if (filters.location) params.set("location", filters.location)
      if (filters.role) params.set("role", filters.role)
      if (filters.available) params.set("available", "true")
      if (filters.minHourlyRate) params.set("minHourlyRate", filters.minHourlyRate)
      if (filters.maxHourlyRate) params.set("maxHourlyRate", filters.maxHourlyRate)
      params.set("page", page.toString())

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search?${params.toString()}`)

      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.pages)
    } catch (error: any) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: error.message || "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load more results
  const loadMore = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  // Initial search on page load
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Find Developers</h1>
        <p className="text-muted-foreground">Search for developers by name, skills, location, and more</p>

        {/* Search bar and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, username, or bio..."
              className="pl-9 pr-4"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
          </div>

          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {Object.values(filters).some((v) => v !== "" && v !== false && v !== "0" && v !== "200") && (
                    <Badge variant="secondary" className="ml-1">
                      Active
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                  <SheetDescription>Refine your search with specific filters</SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      placeholder="React, TypeScript, Node.js..."
                      value={filters.skills}
                      onChange={(e) => handleFilterChange("skills", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      placeholder="English, Spanish, French..."
                      value={filters.languages}
                      onChange={(e) => handleFilterChange("languages", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple languages with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, Remote..."
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Role</SelectItem>
                        {commonRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                      <span className="text-sm">
                        ${filters.minHourlyRate} - ${filters.maxHourlyRate}
                      </span>
                    </div>
                    <Slider
                      id="hourly-rate"
                      min={0}
                      max={200}
                      step={5}
                      value={[Number(filters.minHourlyRate), Number(filters.maxHourlyRate)]}
                      onValueChange={handleRateChange}
                      className="py-4"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={filters.available}
                      onCheckedChange={(checked) => handleFilterChange("available", checked)}
                    />
                    <Label htmlFor="available">Available for work only</Label>
                  </div>
                </div>

                <SheetFooter className="sm:justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button
                    onClick={() => {
                      applySearch()
                      document.querySelector("[data-radix-collection-item]")?.click() // Close sheet
                    }}
                  >
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Button onClick={applySearch}>Search</Button>
          </div>
        </div>

        {/* Active filters display */}
        {Object.entries(filters).some(
          ([key, value]) => value && value !== false && value !== "0" && !(key === "maxHourlyRate" && value === "200"),
        ) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.skills && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Skills: {filters.skills}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("skills", "")
                    applySearch()
                  }}
                />
              </Badge>
            )}

            {filters.languages && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Languages: {filters.languages}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("languages", "")
                    applySearch()
                  }}
                />
              </Badge>
            )}

            {filters.location && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Location: {filters.location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("location", "")
                    applySearch()
                  }}
                />
              </Badge>
            )}

            {filters.role && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Role: {filters.role}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("role", "")
                    applySearch()
                  }}
                />
              </Badge>
            )}

            {filters.available && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Available for work
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("available", false)
                    applySearch()
                  }}
                />
              </Badge>
            )}

            {(filters.minHourlyRate !== "0" || filters.maxHourlyRate !== "200") && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Rate: ${filters.minHourlyRate} - ${filters.maxHourlyRate}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange("minHourlyRate", "0")
                    handleFilterChange("maxHourlyRate", "200")
                    applySearch()
                  }}
                />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                resetFilters()
                applySearch()
              }}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Search results */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching...</p>
          </div>
        </div>
      ) : users.length > 0 ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map((user) => (
              <motion.div key={user._id} variants={itemVariants}>
                <Link href={`/profile/${user._id}`}>
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          {user.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        {user.role && <p className="text-sm">{user.role}</p>}
                        {user.location && <p className="text-sm text-muted-foreground">{user.location}</p>}

                        {/* Skills */}
                        {user.skills && user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {user.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {user.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Availability badge */}
                        {user.available && (
                          <div className="pt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Available for work
                              {user.hourlyRate && ` • $${user.hourlyRate}/hr`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Load more button */}
          {page < totalPages && (
            <div className="flex justify-center pt-6">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Results"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            We couldn't find any developers matching your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  )
}
