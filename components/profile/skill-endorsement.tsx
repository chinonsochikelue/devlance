"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, ThumbsUp, X, MessageSquare } from "lucide-react"
import VerificationBadge from "@/components/verification-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type Endorser = {
  _id: string
  name: string
  username: string
  profilePic?: string
  verified?: boolean
}

type Endorsement = {
  _id: string
  skill: string
  endorser: Endorser
  comment?: string
  createdAt: string
}

type EndorsementGroup = {
  _id: string // skill name
  count: number
  endorsements: Endorsement[]
}

interface SkillEndorsementsProps {
  userId: string
  userSkills: { name: string; level: string }[]
  isOwnProfile?: boolean
}

export default function SkillEndorsements({ userId, userSkills, isOwnProfile = false }: SkillEndorsementsProps) {
  const { user } = useAuth()
  const [endorsementGroups, setEndorsementGroups] = useState<EndorsementGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const {toast}=useToast()

  useEffect(() => {
    const fetchEndorsements = async () => {
      setLoading(true)
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/endorsements/user/${userId}`)

        if (!res.ok) {
          throw new Error("Failed to fetch endorsements")
        }

        const data = await res.json()
        setEndorsementGroups(data)
      } catch (error: any) {
        console.error("Error fetching endorsements:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to fetch endorsements",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchEndorsements()
    }
  }, [userId])

  const handleEndorseSkill = async () => {
    if (!selectedSkill) {
      toast({
        title: "Error",
        description: "Please select a skill to endorse",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/endorsements`, {
        method: "POST",
        body: JSON.stringify({
          userId,
          skill: selectedSkill,
          comment: comment.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to endorse skill")
      }

      // Refresh endorsements
      const updatedRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/endorsements/user/${userId}`)
      const updatedData = await updatedRes.json()
      setEndorsementGroups(updatedData)

      // Reset form
      setSelectedSkill("")
      setComment("")
      setDialogOpen(false)

      toast({
        title: "Success",
        description: "Skill endorsed successfully",
      })
    } catch (error: any) {
      console.error("Error endorsing skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to endorse skill",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveEndorsement = async (endorsementId: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/endorsements/${endorsementId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to remove endorsement")
      }

      // Refresh endorsements
      const updatedRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/endorsements/user/${userId}`)
      const updatedData = await updatedRes.json()
      setEndorsementGroups(updatedData)

      toast({
        title: "Success",
        description: "Endorsement removed successfully",
      })
    } catch (error: any) {
      console.error("Error removing endorsement:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove endorsement",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Filter out skills that the user has already endorsed
  const getAvailableSkills = () => {
    if (!user) return []

    const endorsedSkills = new Set()
    endorsementGroups.forEach((group) => {
      if (group.endorsements.some((e) => e.endorser._id === user._id)) {
        endorsedSkills.add(group._id)
      }
    })

    return userSkills.filter((skill) => !endorsedSkills.has(skill.name))
  }

  // Check if current user has endorsed a skill
  const hasEndorsed = (skillName: string) => {
    if (!user) return false

    const group = endorsementGroups.find((g) => g._id === skillName)
    return group?.endorsements.some((e) => e.endorser._id === user._id) || false
  }

  // Get user's endorsement for a skill
  const getUserEndorsement = (skillName: string) => {
    if (!user) return null

    const group = endorsementGroups.find((g) => g._id === skillName)
    return group?.endorsements.find((e) => e.endorser._id === user._id)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Endorsement button */}
      {!isOwnProfile && user && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Endorse Skills
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Endorse Skills</DialogTitle>
              <DialogDescription>Endorse this developer's skills to help them stand out</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Skill</label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSkills().length > 0 ? (
                    getAvailableSkills().map((skill) => (
                      <Badge
                        key={skill.name}
                        variant={selectedSkill === skill.name ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedSkill(skill.name)}
                      >
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">You've already endorsed all available skills</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comment (Optional)</label>
                <Textarea
                  placeholder="Share your experience working with this skill..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEndorseSkill}
                disabled={!selectedSkill || submitting || getAvailableSkills().length === 0}
              >
                {submitting ? "Endorsing..." : "Endorse Skill"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Skills with endorsements */}
      {endorsementGroups.length > 0 ? (
        <div className="space-y-6">
          {endorsementGroups.map((group) => (
            <div key={group._id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{group._id}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {group.count} {group.count === 1 ? "endorsement" : "endorsements"}
                  </Badge>
                </div>

                {/* Show/remove endorsement button */}
                {user &&
                  !isOwnProfile &&
                  (hasEndorsed(group._id) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        const endorsement = getUserEndorsement(group._id)
                        if (endorsement) {
                          handleRemoveEndorsement(endorsement._id)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                      Remove Endorsement
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => {
                        setSelectedSkill(group._id)
                        setDialogOpen(true)
                      }}
                    >
                      <PlusCircle className="h-3 w-3" />
                      Endorse
                    </Button>
                  ))}
              </div>

              {/* Endorser avatars */}
              <div className="flex flex-wrap gap-2">
                {group.endorsements.slice(0, 8).map((endorsement) => (
                  <Popover key={endorsement._id}>
                    <PopoverTrigger asChild>
                      <div className="relative cursor-pointer">
                        <Avatar className="h-8 w-8 border border-background">
                          <AvatarImage
                            src={endorsement.endorser.profilePic || "/placeholder.svg"}
                            alt={endorsement.endorser.name}
                          />
                          <AvatarFallback>{getInitials(endorsement.endorser.name)}</AvatarFallback>
                        </Avatar>
                        {endorsement.endorser.verified && (
                          <div className="absolute -bottom-1 -right-1">
                            <VerificationBadge size="sm" showTooltip={false} />
                          </div>
                        )}
                        {endorsement.comment && (
                          <div className="absolute -bottom-1 -right-1">
                            <div className="bg-primary rounded-full p-0.5">
                              <MessageSquare className="h-2 w-2 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="flex items-start gap-3">
                        <Link href={`/profile/${endorsement.endorser._id}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={endorsement.endorser.profilePic || "/placeholder.svg"}
                              alt={endorsement.endorser.name}
                            />
                            <AvatarFallback>{getInitials(endorsement.endorser.name)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${endorsement.endorser._id}`} className="font-medium hover:underline">
                              {endorsement.endorser.name}
                            </Link>
                            {endorsement.endorser.verified && <VerificationBadge size="sm" />}
                          </div>
                          <p className="text-sm text-muted-foreground">@{endorsement.endorser.username}</p>
                          {endorsement.comment && (
                            <div className="mt-2 text-sm bg-muted p-3 rounded-md">"{endorsement.comment}"</div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
                {group.count > 8 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                    +{group.count - 8}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <ThumbsUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No endorsements yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isOwnProfile ? "Your skills haven't been endorsed yet" : "Be the first to endorse this developer's skills"}
          </p>
        </div>
      )}
    </div>
  )
}
