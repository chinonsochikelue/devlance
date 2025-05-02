"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function ProfileCompletionMeter() {
  const { user } = useAuth()
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [incompleteItems, setIncompleteItems] = useState<{ name: string; path: string }[]>([])

  useEffect(() => {
    if (!user) return

    // Define all profile sections to check
    const profileSections = [
      { name: "Profile Picture", check: !!user.profilePic, path: "/settings/profile" },
      { name: "Cover Image", check: !!user.coverImage, path: "/settings/profile" },
      { name: "Bio", check: !!user.bio && user.bio.length > 10, path: "/settings/profile" },
      { name: "Role", check: !!user.role, path: "/settings/profile" },
      { name: "Location", check: !!user.location, path: "/settings/profile" },
      { name: "Education", check: user.education && user.education.length > 0, path: "/settings/education" },
      { name: "Experience", check: user.experience && user.experience.length > 0, path: "/settings/experience" },
      { name: "Languages", check: user.languages && user.languages.length > 0, path: "/settings/languages" },
      { name: "Skills", check: user.skills && user.skills.length > 0, path: "/settings/skills" },
      { name: "Links", check: user.links && user.links.length > 0, path: "/settings/links" },
      { name: "GitHub", check: !!user.githubUsername, path: "/settings/github" },
      { name: "Availability", check: user.availableFrom !== undefined, path: "/settings/availability" },
    ]

    // Calculate completion percentage
    const completedSections = profileSections.filter((section) => section.check).length
    const percentage = Math.round((completedSections / profileSections.length) * 100)
    setCompletionPercentage(percentage)

    // Get incomplete items
    const incomplete = profileSections
      .filter((section) => !section.check)
      .map((section) => ({ name: section.name, path: section.path }))
    setIncompleteItems(incomplete)
  }, [user])

  if (!user) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Profile Completion</CardTitle>
        <CardDescription>Complete your profile to increase visibility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{completionPercentage}% complete</span>
            {completionPercentage === 100 ? (
              <span className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Complete
              </span>
            ) : (
              <span className="flex items-center text-sm text-amber-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                Incomplete
              </span>
            )}
          </div>
          <Progress value={completionPercentage} className="h-2" />

          {incompleteItems.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Complete these items:</h4>
              <ul className="space-y-1">
                {incompleteItems.slice(0, 3).map((item, index) => (
                  <li key={index}>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto" asChild>
                      <Link href={item.path}>
                        <span className="text-sm">{item.name}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                ))}
                {incompleteItems.length > 3 && (
                  <li className="text-xs text-muted-foreground text-center pt-1">
                    +{incompleteItems.length - 3} more items
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
