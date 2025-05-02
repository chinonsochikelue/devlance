"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Github, ExternalLink, Code, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GithubConnectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [repos, setRepos] = useState<any[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])

  useEffect(() => {
    // Check if we have a code parameter in the URL (GitHub OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")


    if (code && state) {
      // Exchange code for access token
      handleGitHubCallback(code, state)
      // Remove the code from the URL to prevent reuse
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Check if user is already connected to GitHub
    if (user?.githubUsername) {
      setConnected(true)
      fetchGithubRepos()
    }
  }, [user])

  const handleGitHubCallback = async (code: string, state: string) => {
    setLoading(true)

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/users/github/callback", {
        method: "POST",
        body: JSON.stringify({ code, state }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to connect GitHub account")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setConnected(true)

      toast({
        title: "GitHub Connected",
        description: "Your GitHub account has been successfully connected",
      })

      fetchGithubRepos()
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect GitHub account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initiateGitHubOAuth = async () => {
    setLoading(true)

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/users/github/authorize")

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to initiate GitHub authorization")
      }

      const { authUrl } = await res.json()
      // Redirect user to GitHub authorization page
      window.location.href = authUrl
    } catch (error: any) {
      toast({
        title: "Authorization Failed",
        description: error.message || "Failed to initiate GitHub authorization",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const disconnectGithub = async () => {
    setLoading(true)

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/users/github/disconnect", {
        method: "POST",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to disconnect GitHub account")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setConnected(false)
      setRepos([])
      setSelectedRepos([])

      toast({
        title: "GitHub Disconnected",
        description: "Your GitHub account has been disconnected",
      })
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect GitHub account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGithubRepos = async () => {
    setLoadingRepos(true)

    try {
      const res = await fetchWithAuth("http://localhost:5000/api/users/github/repos")

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch GitHub repositories")
      }

      const data = await res.json()
      setRepos(data)

      // Set initially selected repos if user already has some
      if (user?.githubRepos) {
        setSelectedRepos(user.githubRepos.map((repo: any) => repo.id.toString()))
      }
    } catch (error: any) {
      toast({
        title: "Failed to Load Repositories",
        description: error.message || "Could not fetch your GitHub repositories",
        variant: "destructive",
      })
    } finally {
      setLoadingRepos(false)
    }
  }

  const toggleRepoSelection = (repoId: string) => {
    setSelectedRepos((prev) => {
      if (prev.includes(repoId)) {
        return prev.filter((id) => id !== repoId)
      } else {
        return [...prev, repoId]
      }
    })
  }

  const saveSelectedRepos = async () => {
    try {
      const selectedReposData = repos.filter((repo) => selectedRepos.includes(repo.id.toString()))

      const res = await fetchWithAuth("http://localhost:5000/api/users/github/update-github-repos", {
        method: "PUT",
        body: JSON.stringify({ githubRepos: selectedReposData }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save selected repositories")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)

      toast({
        title: "Repositories Saved",
        description: "Your selected GitHub repositories have been saved to your profile",
      })
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save repositories",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">GitHub Integration</h1>
        <p className="text-muted-foreground">
          Connect your GitHub account to showcase your repositories on your profile
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Connection
            </CardTitle>
            <CardDescription>Connect your GitHub account to showcase your work</CardDescription>
          </CardHeader>
          <CardContent>
            {!connected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to display your repositories on your profile. This helps other developers
                  discover your work and contributions.
                </p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authorization Required</AlertTitle>
                  <AlertDescription>
                    You'll be redirected to GitHub to authorize this application. We'll only access your public profile
                    and repositories.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                  <Github className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Connected to GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      Username: <span className="font-medium">{user?.githubUsername}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            {!connected ? (
              <Button onClick={initiateGitHubOAuth} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Connect with GitHub
                  </>
                )}
              </Button>
            ) : (
              <Button variant="destructive" onClick={disconnectGithub} disabled={loading}>
                {loading ? "Disconnecting..." : "Disconnect GitHub"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {connected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                GitHub Repositories
              </CardTitle>
              <CardDescription>Select repositories to showcase on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRepos ? (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading repositories...</p>
                  </div>
                </div>
              ) : repos.length > 0 ? (
                <div className="space-y-4">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className={`flex items-start gap-4 p-4 border rounded-md cursor-pointer transition-colors ${selectedRepos.includes(repo.id.toString()) ? "border-primary bg-primary/5" : ""
                        }`}
                      onClick={() => toggleRepoSelection(repo.id.toString())}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRepos.includes(repo.id.toString())}
                        onChange={() => toggleRepoSelection(repo.id.toString())}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{repo.name}</h3>
                          {repo.private ? (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Private
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Public</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {repo.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {repo.language && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{repo.language}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View repository</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No repositories found</p>
                  <Button variant="outline" className="mt-4" onClick={fetchGithubRepos}>
                    Refresh Repositories
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={fetchGithubRepos} disabled={loadingRepos}>
                Refresh Repositories
              </Button>
              <Button
                onClick={saveSelectedRepos}
                disabled={repos.length === 0 || loadingRepos || selectedRepos.length === 0}
              >
                Save Selected Repositories ({selectedRepos.length})
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
