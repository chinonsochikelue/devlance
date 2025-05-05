"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Loader2, Search } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { debounce } from "lodash"
import VerificationBadge from "@/components/verification-badge"
import { useToast } from "@/hooks/use-toast"

interface AddGroupMembersProps {
  groupId: string
  currentMembers: string[]
  onMembersAdded: () => void
}

export default function AddGroupMembers({ groupId, currentMembers, onMembersAdded }: AddGroupMembersProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const { toast } = useToast();

  // Reset selected users when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedUsers([])
      setSearchQuery("")
      setSearchResults([])
    }
  }, [open])

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/users?q=${query}`)
      if (!res.ok) throw new Error("Failed to search users")

      const data = await res.json()

      // Filter out users who are already members
      const filteredResults = data.users.filter((user: any) => !currentMembers.includes(user._id))
      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const debouncedSearch = debounce(handleSearch, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    debouncedSearch(e.target.value)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user to add",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ members: selectedUsers }),
      })

      if (!res.ok) throw new Error("Failed to add members")

      toast({
        title: "Success",
        description: `Added ${selectedUsers.length} member${selectedUsers.length > 1 ? "s" : ""} to the group`,
      })

      setOpen(false)
      onMembersAdded()
    } catch (error) {
      console.error("Error adding members:", error)
      toast({
        title: "Error",
        description: "Failed to add members to the group",
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
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Group Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <ScrollArea className="h-[40vh]">
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                    <Checkbox
                      id={`user-${user._id}`}
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={() => toggleUserSelection(user._id)}
                    />
                    <label htmlFor={`user-${user._id}`} className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{user.name}</span>
                          {user.verified && <VerificationBadge size="sm" />}
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchQuery ? (
            <div className="text-center py-8 text-muted-foreground">No users found matching "{searchQuery}"</div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Search for users to add to the group</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={selectedUsers.length === 0 || loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
