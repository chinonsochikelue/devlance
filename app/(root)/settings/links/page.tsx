"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PlusCircle,
  Trash2,
  LinkIcon,
  ExternalLink,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  FileText,
  Dribbble,
  Square,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Link = {
  type: string
  url: string
  title: string
}

export default function LinksSettingsPage() {
  const { user, setUser } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const [currentLink, setCurrentLink] = useState<Link>({
    type: "",
    url: "",
    title: "",
  })

  useEffect(() => {
    if (user?.links) {
      setLinks(user.links)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentLink((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setCurrentLink((prev) => ({ ...prev, type: value }))
  }

  const handleAddLink = async () => {
    // Validate inputs
    if (!currentLink.type || !currentLink.url || !currentLink.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(currentLink.url)
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updatedLinks = [...links, currentLink]

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update-links`, {
        method: "PUT",
        body: JSON.stringify({ links: updatedLinks }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update links")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setLinks(updatedUser.links || [])
      setCurrentLink({ type: "", url: "", title: "" })
      setDialogOpen(false)

      toast({
        title: "Link Added",
        description: "Your link has been successfully added",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update links",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLink = async (index: number) => {
    setLoading(true)

    try {
      const updatedLinks = links.filter((_, i) => i !== index)

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({ links: updatedLinks }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update links")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setLinks(updatedUser.links || [])

      toast({
        title: "Link Removed",
        description: "Your link has been successfully removed",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update links",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getLinkIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "website":
        return <Globe className="h-4 w-4" />
      case "github":
        return <Github className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "medium":
        return <FileText className="h-4 w-4" />
      case "dribbble":
        return <Dribbble className="h-4 w-4" />
      case "behance":
        return <Square className="h-4 w-4" />
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Links</h1>
        <p className="text-muted-foreground">Manage your external links and social profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            External Links
          </CardTitle>
          <CardDescription>Add links to your website and social profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {links.length > 0 ? (
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    {getLinkIcon(link.type)}
                    <div>
                      <h3 className="font-medium">{link.title}</h3>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        {link.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)} disabled={loading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No links added yet</h3>
              <p className="text-muted-foreground mt-2">Add links to your website and social profiles</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Link</DialogTitle>
                <DialogDescription>Add a link to your website or social profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Link Type</Label>
                  <Select value={currentLink.type} onValueChange={handleTypeChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Dribbble">Dribbble</SelectItem>
                      <SelectItem value="Behance">Behance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="My Personal Website"
                    value={currentLink.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    placeholder="https://example.com"
                    value={currentLink.url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLink} disabled={loading}>
                  {loading ? "Adding..." : "Add Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
