"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FileDown, FileText, Check } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface ResumeExportProps {
  userId: string
  isOwnProfile?: boolean
}

export default function ResumeExport({ userId, isOwnProfile = false }: ResumeExportProps) {
  const { user } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const {toast}=useToast()
  const [sections, setSections] = useState({
    summary: true,
    skills: true,
    experience: true,
    education: true,
    languages: true,
    contact: true,
  })

  const handleSectionToggle = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleDownload = async () => {
    setDownloading(true)

    try {
      // Create query params for sections to include
      const params = new URLSearchParams()
      Object.entries(sections).forEach(([key, value]) => {
        if (value) params.append(key, "true")
      })

      // Generate and download the resume
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resume/${userId}?${params.toString()}`

      // Create a hidden link and click it to download
      const link = document.createElement("a")
      link.href = url
      link.download = `${user?.username || "developer"}-resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Resume Downloaded",
        description: "Your resume has been successfully downloaded",
      })
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Export
        </CardTitle>
        <CardDescription>
          {isOwnProfile
            ? "Export your profile as a professional resume"
            : "Export this profile as a professional resume"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="summary"
                checked={sections.summary}
                onCheckedChange={() => handleSectionToggle("summary")}
              />
              <label
                htmlFor="summary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Summary/Bio
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="skills" checked={sections.skills} onCheckedChange={() => handleSectionToggle("skills")} />
              <label
                htmlFor="skills"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skills
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="experience"
                checked={sections.experience}
                onCheckedChange={() => handleSectionToggle("experience")}
              />
              <label
                htmlFor="experience"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Experience
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="education"
                checked={sections.education}
                onCheckedChange={() => handleSectionToggle("education")}
              />
              <label
                htmlFor="education"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Education
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="languages"
                checked={sections.languages}
                onCheckedChange={() => handleSectionToggle("languages")}
              />
              <label
                htmlFor="languages"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Languages
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contact"
                checked={sections.contact}
                onCheckedChange={() => handleSectionToggle("contact")}
              />
              <label
                htmlFor="contact"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Contact Info
              </label>
            </div>
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Professional PDF Format</p>
                <p className="text-xs text-muted-foreground">
                  The resume will be generated as a professional PDF document that you can share with potential
                  employers or clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} disabled={downloading} className="w-full">
          {downloading ? (
            <>Downloading...</>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Resume
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
