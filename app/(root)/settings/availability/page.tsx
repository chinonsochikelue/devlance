"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

export default function AvailabilitySettingsPage() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    available: false,
    isFrozen: false,
    availableFrom: "",
    hourlyRate: "",
  })
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        available: user.available || false,
        isFrozen: user.isFrozen || false,
        availableFrom: user.availableFrom || "",
        hourlyRate: user.hourlyRate?.toString() || "",
      })

      if (user.availableFrom) {
        setDate(new Date(user.availableFrom))
      }
    }
  }, [user])

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    if (date) {
      setFormData({ ...formData, availableFrom: date.toISOString().split("T")[0] })
    } else {
      setFormData({ ...formData, availableFrom: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetchWithAuth(`http://localhost:5000/api/users/update/${user?._id}`, {
        method: "PUT",
        body: JSON.stringify({
          available: formData.available,
          isFrozen: formData.isFrozen,
          availableFrom: formData.availableFrom,
          hourlyRate: formData.hourlyRate ? Number.parseFloat(formData.hourlyRate) : 0,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update availability")
      }

      const updatedUser = await res.json()
      setUser(updatedUser)

      toast({
        title: "Availability Updated",
        description: "Your availability settings have been successfully updated",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Availability</h1>
        <p className="text-muted-foreground">Manage your availability settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Settings
            </CardTitle>
            <CardDescription>Control your availability status and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="available">Available for Work</Label>
                <p className="text-sm text-muted-foreground">
                  Show others that you are available for new opportunities
                </p>
              </div>
              <Switch id="available" checked={formData.available} onCheckedChange={handleSwitchChange("available")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isFrozen">Freeze Account</Label>
                <p className="text-sm text-muted-foreground">Temporarily hide your profile from other users</p>
              </div>
              <Switch id="isFrozen" checked={formData.isFrozen} onCheckedChange={handleSwitchChange("isFrozen")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableFrom">Available From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Set the date from which you will be available for new opportunities
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  className="pl-9"
                  placeholder="50"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Set your hourly rate for potential clients (set to 0 to hide)
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
