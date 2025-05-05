"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const applicationSchema = z.object({
    coverLetter: z.string().min(50, {
        message: "Cover letter should be at least 50 characters",
    }),
    resumeUrl: z.string().optional(),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface JobApplicationFormProps {
    jobId: string
    onSuccess?: () => void
}

export default function JobApplicationForm({ jobId, onSuccess }: JobApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const { toast } = useToast()

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            coverLetter: "",
            resumeUrl: "",
        },
    })

    async function onSubmit(data: ApplicationFormValues) {
        setIsSubmitting(true)

        try {
            // If there's a resume file, upload it first
            let resumeUrl = ""
            if (resumeFile) {
                const formData = new FormData()
                formData.append("resume", resumeFile)

                const uploadResponse = await fetch("/api/upload/resume", {
                    method: "POST",
                    body: formData,
                })

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload resume")
                }

                const uploadResult = await uploadResponse.json()
                resumeUrl = uploadResult.fileUrl
            }

            // Submit the application with the resume URL
            const response = await fetch(`/api/jobs/${jobId}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    resumeUrl: resumeUrl || data.resumeUrl,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to submit application")
            }

            toast({
                title: "Application Submitted!",
                description: "Your job application has been successfully submitted.",
            })

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error("Error submitting application:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit application",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0])
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Explain why you're a good fit for this position..."
                                    className="min-h-[200px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Highlight relevant skills and experience</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Resume</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-3">
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {resumeFile && <p className="text-sm text-muted-foreground truncate max-w-[200px]">{resumeFile.name}</p>}
                        </div>
                    </FormControl>
                    <FormDescription>Upload your resume (PDF, DOC, or DOCX format)</FormDescription>
                </FormItem>

                <FormField
                    control={form.control}
                    name="resumeUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Or provide a link to your resume</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/my-resume.pdf" {...field} />
                            </FormControl>
                            <FormDescription>You can link to your resume if you have it hosted online</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Application...
                        </>
                    ) : (
                        "Submit Application"
                    )}
                </Button>
            </form>
        </Form>
    )
}
