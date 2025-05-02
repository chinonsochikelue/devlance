"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2, Briefcase } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type Experience = {
  role: string
  company: string
  period: string
  description: string
}

export default function ExperienceSettingsPage() {
  const { user, setUser } = useAuth()
  const [experience, setExperience] = useState<Experience[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast();
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    role: "",
    company: "",
    period: "",
    description: "",
  })

  useEffect(() => {
    if (user?.experience) {
      setExperience(user.experience)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentExperience((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddExperience = async () => {
    // Validate inputs
    if (
      !currentExperience.role ||
      !currentExperience.company ||
      !currentExperience.period ||
      !currentExperience.description
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updatedExperience = [...experience, currentExperience]

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update-experience`, {
        method: "PUT",
        body: JSON.stringify({ experience: updatedExperience }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update experience")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setExperience(updatedUser.experience || [])
      setCurrentExperience({ role: "", company: "", period: "", description: "" })
      setDialogOpen(false)

      toast({
        title: "Experience Added",
        description: "Your experience has been successfully added",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update experience",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveExperience = async (index: number) => {
    setLoading(true)

    try {
      const updatedExperience = experience.filter((_, i) => i !== index)

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({ experience: updatedExperience }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update experience")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setExperience(updatedUser.experience || [])

      toast({
        title: "Experience Removed",
        description: "Your experience has been successfully removed",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update experience",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Experience</h1>
        <p className="text-muted-foreground">Manage your professional experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Experience
          </CardTitle>
          <CardDescription>Add your work experience to your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {experience.length > 0 ? (
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{exp.role}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">{exp.period}</p>
                    <p className="text-sm mt-2 line-clamp-2">{exp.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveExperience(index)} disabled={loading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No experience added yet</h3>
              <p className="text-muted-foreground mt-2">Add your professional experience to your profile</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Experience</DialogTitle>
                <DialogDescription>Add your professional experience to your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="Software Engineer"
                    value={currentExperience.role}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Tech Company Inc."
                    value={currentExperience.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    name="period"
                    placeholder="Jan 2020 - Present"
                    value={currentExperience.period}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your responsibilities and achievements"
                    value={currentExperience.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExperience} disabled={loading}>
                  {loading ? "Adding..." : "Add Experience"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
