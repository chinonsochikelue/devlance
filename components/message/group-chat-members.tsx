"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, MoreVertical, Crown, UserMinus, ShieldCheck, Shield } from "lucide-react"
import VerificationBadge from "@/components/verification-badge"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import OnlineStatus from "./online-status"

interface GroupMember {
  _id: string
  name: string
  username: string
  profilePic?: string
  verified?: boolean
}

interface GroupChatMembersProps {
  groupId: string
  members: GroupMember[]
  admins: string[]
  createdBy: string
  currentUserId: string
  onMemberUpdate: () => void
}

export default function GroupChatMembers({
  groupId,
  members,
  admins,
  createdBy,
  currentUserId,
  onMemberUpdate,
}: GroupChatMembersProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isAdmin = admins.includes(currentUserId)
  const isCreator = createdBy === currentUserId

  const handleRemoveMember = async (userId: string) => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to remove member")

      toast({
        title: "Success",
        description: "Member removed from group",
      })
      onMemberUpdate()
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${groupId}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) throw new Error("Failed to promote member")

      toast({
        title: "Success",
        description: "Member promoted to admin",
      })
      onMemberUpdate()
    } catch (error) {
      console.error("Error promoting member:", error)
      toast({
        title: "Error",
        description: "Failed to promote member",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    if (!isAdmin || userId === createdBy) return

    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${groupId}/admins/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to remove admin status")

      toast({
        title: "Success",
        description: "Admin status removed",
      })
      onMemberUpdate()
    } catch (error) {
      console.error("Error removing admin status:", error)
      toast({
        title: "Error",
        description: "Failed to remove admin status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Members ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {members.map((member) => {
              const isUserAdmin = admins.includes(member._id)
              const isUserCreator = member._id === createdBy

              return (
                <div key={member._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.profilePic || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <OnlineStatus userId={member._id} className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{member.name}</span>
                        {member.verified && <VerificationBadge size="sm" />}
                        {isUserCreator && (
                          <Badge variant="outline" className="ml-1 px-1.5 py-0 h-5">
                            <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                            <span className="text-xs">Creator</span>
                          </Badge>
                        )}
                        {isUserAdmin && !isUserCreator && (
                          <Badge variant="outline" className="ml-1 px-1.5 py-0 h-5">
                            <ShieldCheck className="h-3 w-3 mr-1 text-primary" />
                            <span className="text-xs">Admin</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>

                  {isAdmin && member._id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={loading}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isUserAdmin ? (
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(member._id)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          !isUserCreator && (
                            <DropdownMenuItem onClick={() => handleRemoveAdmin(member._id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )
                        )}
                        <DropdownMenuItem onClick={() => handleRemoveMember(member._id)}>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
