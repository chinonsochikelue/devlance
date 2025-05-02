"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, Globe } from "lucide-react"
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

type Language = {
  name: string
  level: string
}

export default function LanguagesSettingsPage() {
  const { user, setUser } = useAuth()
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>({
    name: "",
    level: "",
  })

  useEffect(() => {
    if (user?.languages) {
      setLanguages(user.languages)
    }
  }, [user])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLanguage((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleLevelChange = (value: string) => {
    setCurrentLanguage((prev) => ({ ...prev, level: value }))
  }

  const handleAddLanguage = async () => {
    // Validate inputs
    if (!currentLanguage.name || !currentLanguage.level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updatedLanguages = [...languages, currentLanguage]

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update-languages`, {
        method: "PUT",
        body: JSON.stringify({ languages: updatedLanguages }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update languages")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setLanguages(updatedUser.languages || [])
      setCurrentLanguage({ name: "", level: "" })
      setDialogOpen(false)

      toast({
        title: "Language Added",
        description: "Your language has been successfully added",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update languages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLanguage = async (index: number) => {
    setLoading(true)

    try {
      const updatedLanguages = languages.filter((_, i) => i !== index)

      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({ languages: updatedLanguages }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update languages")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setLanguages(updatedUser.languages || [])

      toast({
        title: "Language Removed",
        description: "Your language has been successfully removed",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update languages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case "native":
        return "bg-green-100 text-green-800"
      case "fluent":
        return "bg-blue-100 text-blue-800"
      case "advanced":
        return "bg-indigo-100 text-indigo-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "beginner":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Languages</h1>
        <p className="text-muted-foreground">Manage your language proficiencies</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Languages
          </CardTitle>
          <CardDescription>Add languages you speak to your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {languages.length > 0 ? (
            <div className="space-y-4">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{lang.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeClass(lang.level)}`}>
                      {lang.level}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveLanguage(index)} disabled={loading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No languages added yet</h3>
              <p className="text-muted-foreground mt-2">Add languages you speak to your profile</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Language</DialogTitle>
                <DialogDescription>Add a language you speak to your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Language</Label>
                  <Input
                    id="name"
                    placeholder="English, Spanish, French, etc."
                    value={currentLanguage.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Proficiency Level</Label>
                  <Select value={currentLanguage.level} onValueChange={handleLevelChange}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Native">Native</SelectItem>
                      <SelectItem value="Fluent">Fluent</SelectItem>
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
                <Button onClick={handleAddLanguage} disabled={loading}>
                  {loading ? "Adding..." : "Add Language"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
