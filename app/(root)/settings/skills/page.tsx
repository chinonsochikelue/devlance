"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, Code } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type Skill = {
  name: string
  level: string
}

export default function SkillsSettingsPage() {
  const { user, setUser } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast();
  const [currentSkill, setCurrentSkill] = useState<Skill>({
    name: "",
    level: "",
  })

  useEffect(() => {
    if (user?.languages) {
      setSkills(user.skills)
    }
  }, [user])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSkill((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleLevelChange = (value: string) => {
    setCurrentSkill((prev) => ({ ...prev, level: value }))
  }

  const handleAddSkill = async () => {
    // Validate inputs
    if (!currentSkill.name || !currentSkill.level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updatedSkills = [...skills, currentSkill]

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update-skills`, {
        method: "PUT",
        body: JSON.stringify({ skills: updatedSkills }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update skills")
      }

      const updatedUser = await res.json()
      setUser({ ...updatedUser, skills: updatedSkills }) // Manually update since it might not be in the model
      setSkills(updatedSkills)
      setCurrentSkill({ name: "", level: "" })
      setDialogOpen(false)

      toast({
        title: "Skill Added",
        description: "Your skill has been successfully added",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update skills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSkill = async (index: number) => {
    setLoading(true)

    try {
      const updatedSkills = skills.filter((_, i) => i !== index)

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({ skills: updatedSkills }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update skills")
      }

      const updatedUser = await res.json()
      setUser({ ...updatedUser, skills: updatedSkills }) // Manually update since it might not be in the model
      setSkills(updatedSkills)

      toast({
        title: "Skill Removed",
        description: "Your skill has been successfully removed",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update skills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "advanced":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "beginner":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Skills</h1>
        <p className="text-muted-foreground">Manage your technical and professional skills</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>Add your technical and professional skills to your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill, index) => (
                <Badge key={index} className={`px-3 py-1 ${getLevelColor(skill.level)} cursor-default`}>
                  {skill.name}
                  <span className="ml-1 text-xs opacity-70">{skill.level}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 rounded-full p-0"
                    onClick={() => handleRemoveSkill(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No skills added yet</h3>
              <p className="text-muted-foreground mt-2">Add your technical and professional skills to your profile</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Skill</DialogTitle>
                <DialogDescription>Add a technical or professional skill to your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    placeholder="React, JavaScript, Project Management, etc."
                    value={currentSkill.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Proficiency Level</Label>
                  <Select value={currentSkill.level} onValueChange={handleLevelChange}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSkill} disabled={loading}>
                  {loading ? "Adding..." : "Add Skill"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
