"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const jobFormSchema = z.object({
    title: z.string().min(5, { message: "Title must be at least 5 characters" }),
    company: z.string().min(2, { message: "Company name is required" }),
    location: z.string().min(2, { message: "Location is required" }),
    type: z.string().min(1, { message: "Job type is required" }),
    salary: z.string().optional(),
    description: z.string().min(20, { message: "Description must be at least 20 characters" }),
    requirements: z.string().min(20, { message: "Requirements must be at least 20 characters" }),
    contactEmail: z.string().email({ message: "Invalid email address" }),
})

type JobFormValues = z.infer<typeof jobFormSchema>

export default function JobPostingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            title: "",
            company: "",
            location: "",
            type: "",
            salary: "",
            description: "",
            requirements: "",
            contactEmail: "",
        },
    })

    async function onSubmit(data: JobFormValues) {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to post job")
            }

            const result = await response.json()
            toast({
                title: "Success!",
                description: "Your job posting has been created.",
            })
            router.push(`/jobs/${result.job._id}`)
        } catch (error) {
            console.error("Error posting job:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to post job",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="San Francisco, CA (or Remote)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salary Range (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="$100,000 - $130,000" {...field} />
                            </FormControl>
                            <FormDescription>Providing a salary range increases application rates</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Requirements</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="List the skills, experience, and qualifications required..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="jobs@company.com" {...field} />
                            </FormControl>
                            <FormDescription>This email will receive application notifications</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting Job...
                        </>
                    ) : (
                        "Post Job"
                    )}
                </Button>
            </form>
        </Form>
    )
}
