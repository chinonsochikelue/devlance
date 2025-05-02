"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Star, GitFork, ExternalLink, Code } from "lucide-react"
import ProfileTabs from "@/components/profile/profile-tabs"
import { useToast } from "@/hooks/use-toast"

type Repository = {
  id: string
  name: string
  html_url: string
  description: string
  language: string
  stargazers_count?: number
  forks_count?: number
  private: boolean
  updated_at: string
}

type User = {
  _id: string
  name: string
  username: string
  githubUsername?: string
  githubRepos?: Repository[]
}

export default function GithubProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()


  useEffect(() => {
    const fetchUserAndRepos = async () => {
      setLoading(true)
      try {
        // Fetch user profile
        const userRes = await fetchWithAuth(`http://localhost:5000/api/users/profile/${id}`)

        if (!userRes.ok) {
          throw new Error("Failed to fetch user profile")
        }

        const userData = await userRes.json()
        setUser(userData)

        // If user has GitHub repos, use them
        if (userData.githubRepos && userData.githubRepos.length > 0) {
          setRepos(userData.githubRepos)
        } else if (userData.githubUsername) {
          // Otherwise fetch public repos from GitHub API
          const reposRes = await fetch(
            `https://api.github.com/users/${userData.githubUsername}/repos?sort=updated&per_page=5`,
          )

          if (!reposRes.ok) {
            throw new Error("Failed to fetch GitHub repositories")
          }

          const reposData = await reposRes.json()
          setRepos(reposData)
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load GitHub data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserAndRepos()
    }
  }, [id])

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      "C#": "bg-purple-500",
      PHP: "bg-indigo-500",
      Ruby: "bg-pink-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      Swift: "bg-rose-500",
      Kotlin: "bg-amber-500",
      Dart: "bg-teal-500",
      HTML: "bg-red-600",
      CSS: "bg-blue-600",
    }

    return colors[language] || "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading GitHub repositories...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p className="text-muted-foreground mt-2">The requested user profile could not be found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileTabs />

      {!user.githubUsername ? (
        <div className="text-center py-20">
          <Github className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">No GitHub Account Connected</h2>
          <p className="text-muted-foreground mt-2">{user.name} hasn't connected their GitHub account yet</p>
        </div>
      ) : repos.length > 0 ? (
        <div className="grid gap-6">
          {repos.map((repo) => (
            <Card key={repo.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Code className="h-5 w-5 text-muted-foreground" />
                      {repo.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{repo.description || "No description provided"}</CardDescription>
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="sr-only">View repository</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                      <span className="text-sm">{repo.language}</span>
                    </div>
                  )}

                  {repo.stargazers_count !== undefined && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                  )}

                  {repo.forks_count !== undefined && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GitFork className="h-4 w-4" />
                      <span>{repo.forks_count}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Github className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">No Repositories Found</h2>
          <p className="text-muted-foreground mt-2">No public repositories found for this user</p>
        </div>
      )}
    </div>
  )
}
