"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, GraduationCap } from "lucide-react"
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

type Education = {
  degree: string
  school: string
  year: string
}

export default function EducationSettingsPage() {
  const { user, setUser } = useAuth()
  const [education, setEducation] = useState<Education[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast();
  const [currentEducation, setCurrentEducation] = useState<Education>({
    degree: "",
    school: "",
    year: "",
  })

  useEffect(() => {
    if (user?.education) {
      setEducation(user.education)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentEducation((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEducation = async () => {
    // Validate inputs
    if (!currentEducation.degree || !currentEducation.school || !currentEducation.year) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updatedEducation = [...education, currentEducation]

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update-education`, {
        method: "PUT",
        body: JSON.stringify({ education: updatedEducation }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update education")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setEducation(updatedUser.education || [])
      setCurrentEducation({ degree: "", school: "", year: "" })
      setDialogOpen(false)

      toast({
        title: "Education Added",
        description: "Your education has been successfully added",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update education",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveEducation = async (index: number) => {
    setLoading(true)

    try {
      const updatedEducation = education.filter((_, i) => i !== index)

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({ education: updatedEducation }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update education")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setEducation(updatedUser.education || [])

      toast({
        title: "Education Removed",
        description: "Your education has been successfully removed",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update education",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Education</h1>
        <p className="text-muted-foreground">Manage your educational background</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
          <CardDescription>Add your educational background to your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEducation(index)} disabled={loading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No education added yet</h3>
              <p className="text-muted-foreground mt-2">Add your educational background to your profile</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Education</DialogTitle>
                <DialogDescription>Add your educational background to your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    placeholder="Bachelor of Science in Computer Science"
                    value={currentEducation.degree}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    name="school"
                    placeholder="University of Technology"
                    value={currentEducation.school}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    placeholder="2018 - 2022"
                    value={currentEducation.year}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEducation} disabled={loading}>
                  {loading ? "Adding..." : "Add Education"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
