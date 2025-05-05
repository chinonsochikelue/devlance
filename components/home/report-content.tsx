"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Flag, Loader2 } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type ReportContentProps = {
    contentId: string
    contentModel: "Ping" | "Message"
    variant?: "icon" | "button"
    size?: "sm" | "default"
}

export default function ReportContent({
    contentId,
    contentModel,
    variant = "icon",
    size = "default",
}: ReportContentProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [details, setDetails] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleReport = async () => {
        if (!reason) {
            toast({
                title: "Error",
                description: "Please select a reason for reporting this content",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const res = await fetchWithAuth("/api/moderation/flag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contentId,
                    contentModel,
                    reason,
                    details,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Failed to report content")
            }

            toast({
                title: "Content Reported",
                description: "Thank you for helping keep our community safe. Our team will review this content.",
            })
            setOpen(false)
            setReason("")
            setDetails("")
        } catch (error) {
            console.error("Error reporting content:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to report content",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === "icon" ? (
                    <Button variant="ghost" size={size} className="text-muted-foreground hover:text-foreground">
                        <Flag className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
                        <span className="sr-only">Report content</span>
                    </Button>
                ) : (
                    <Button variant="outline" size={size}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Content</DialogTitle>
                    <DialogDescription>
                        Help us keep the community safe by reporting content that violates our guidelines.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="reason" className="text-sm font-medium">
                            Reason for reporting
                        </label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="spam">Spam</SelectItem>
                                <SelectItem value="harassment">Harassment</SelectItem>
                                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                                <SelectItem value="violence">Violence</SelectItem>
                                <SelectItem value="hate_speech">Hate speech</SelectItem>
                                <SelectItem value="misinformation">Misinformation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="details" className="text-sm font-medium">
                            Additional details (optional)
                        </label>
                        <Textarea
                            id="details"
                            placeholder="Please provide any additional context that might help us understand the issue."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleReport} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
