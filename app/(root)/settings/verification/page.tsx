"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Upload, AlertCircle, Clock, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected"

type VerificationRequest = {
    status: VerificationStatus
    documentType?: string
    documentUrl?: string
    message?: string
    submittedAt?: string
    reviewedAt?: string
    rejectionReason?: string
}

export default function VerificationPage() {
    const { user, setUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified")
    const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null)
    const [documentType, setDocumentType] = useState<string>("id")
    const [documentFile, setDocumentFile] = useState<File | null>(null)
    const [message, setMessage] = useState<string>("")
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState<string>("requirements")

    useEffect(() => {
        // In a real app, fetch the verification status from the backend
        const fetchVerificationStatus = async () => {
            try {
                const res = await fetchWithAuth(`http://localhost:5000/api/users/verification-status`)

                if (res.ok) {
                    const data = await res.json()
                    setVerificationStatus(data.status)
                    setVerificationRequest(data)
                }
            } catch (error) {
                console.error("Error fetching verification status:", error)
            }
        }

        fetchVerificationStatus()

        // For demo purposes, set status based on user's verified field
        if (user?.verified) {
            setVerificationStatus("verified")
            setVerificationRequest({
                status: "verified",
                documentType: "id",
                submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            })
        }
    }, [user])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentFile(e.target.files[0])
        }
    }

    const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentType(e.target.value)
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!documentFile) {
            toast({
                title: "Missing Document",
                description: "Please upload a verification document",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            // First upload the file
            setUploadLoading(true)

            // In a real app, you would upload the file to your server or a storage service
            // For demo purposes, we'll simulate a successful upload
            await new Promise((resolve) => setTimeout(resolve, 1500))

            setUploadLoading(false)

            // Then submit the verification request
            const res = await fetchWithAuth(`http://localhost:5000/api/users/request-verification`, {
                method: "POST",
                body: JSON.stringify({
                    documentType,
                    documentUrl: "https://example.com/uploaded-document.pdf", // In a real app, this would be the URL returned from your upload
                    message,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to submit verification request")
            }

            // For demo purposes, update the local state
            setVerificationStatus("pending")
            setVerificationRequest({
                status: "pending",
                documentType,
                submittedAt: new Date().toISOString(),
                message,
            })

            toast({
                title: "Verification Request Submitted",
                description: "Your verification request has been submitted and is pending review.",
            })
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to submit verification request",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const renderVerificationStatus = () => {
        switch (verificationStatus) {
            case "verified":
                return (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Verified Account</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Your account has been verified. A verification badge is now displayed on your profile.
                        </AlertDescription>
                    </Alert>
                )
            case "pending":
                return (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Verification Pending</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                            Your verification request is currently under review. This process typically takes 3-5 business days.
                        </AlertDescription>
                    </Alert>
                )
            case "rejected":
                return (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Verification Rejected</AlertTitle>
                        <AlertDescription>
                            {verificationRequest?.rejectionReason ||
                                "Your verification request was rejected. Please review the feedback and submit a new request."}
                        </AlertDescription>
                    </Alert>
                )
            default:
                return (
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Not Verified</AlertTitle>
                        <AlertDescription>
                            Your account is not verified. Verified accounts receive a badge and have higher visibility in search
                            results.
                        </AlertDescription>
                    </Alert>
                )
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Account Verification</h1>
                <p className="text-muted-foreground">
                    Verify your account to receive a verification badge and increase your visibility
                </p>
            </div>

            {renderVerificationStatus()}

            {verificationStatus === "verified" ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Verification Details
                        </CardTitle>
                        <CardDescription>Your account verification information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Status</span>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Verification Date</span>
                            <span className="text-sm">
                                {verificationRequest?.reviewedAt
                                    ? new Date(verificationRequest.reviewedAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Document Type</span>
                            <span className="text-sm capitalize">{verificationRequest?.documentType || "ID"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Submission Date</span>
                            <span className="text-sm">
                                {verificationRequest?.submittedAt
                                    ? new Date(verificationRequest.submittedAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : verificationStatus === "pending" ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            Verification in Progress
                        </CardTitle>
                        <CardDescription>Your verification request is being reviewed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                    Pending Review
                                </Badge>
                            </div>
                            <Progress value={40} className="h-2" />
                            <p className="text-sm text-muted-foreground">
                                Verification requests typically take 3-5 business days to process.
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Submission Date</span>
                            <span className="text-sm">
                                {verificationRequest?.submittedAt
                                    ? new Date(verificationRequest.submittedAt).toLocaleDateString()
                                    : new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Document Type</span>
                            <span className="text-sm capitalize">{verificationRequest?.documentType || documentType}</span>
                        </div>
                    </CardContent>
                </Card>
            ) : verificationStatus === "rejected" ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Verification Rejected
                        </CardTitle>
                        <CardDescription>Your verification request was not approved</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTitle>Reason for Rejection</AlertTitle>
                            <AlertDescription>
                                {verificationRequest?.rejectionReason ||
                                    "The provided document did not meet our verification requirements. Please submit a clearer image of your ID."}
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Submission Date</span>
                            <span className="text-sm">
                                {verificationRequest?.submittedAt
                                    ? new Date(verificationRequest.submittedAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Review Date</span>
                            <span className="text-sm">
                                {verificationRequest?.reviewedAt
                                    ? new Date(verificationRequest.reviewedAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => setVerificationStatus("unverified")} className="w-full">
                            Submit New Verification Request
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Get Verified
                        </CardTitle>
                        <CardDescription>Submit your verification request</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                                <TabsTrigger value="submit">Submit Request</TabsTrigger>
                            </TabsList>
                            <TabsContent value="requirements" className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Verification Requirements</h3>
                                    <p className="text-sm text-muted-foreground">
                                        To get verified, you need to provide a valid form of identification that proves you are who you
                                        claim to be.
                                    </p>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Acceptable Documents:</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Government-issued ID card</li>
                                            <li>Passport</li>
                                            <li>Driver's license</li>
                                            <li>Professional certification</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Document Requirements:</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Document must be valid and not expired</li>
                                            <li>All four corners of the document must be visible</li>
                                            <li>Information must be clearly legible</li>
                                            <li>File must be in JPG, PNG, or PDF format</li>
                                            <li>File size must be under 5MB</li>
                                        </ul>
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Privacy Notice</AlertTitle>
                                        <AlertDescription>
                                            Your document will only be used for verification purposes and will be securely stored. We will
                                            never share your identification documents with third parties.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <Button onClick={() => setActiveTab("submit")} className="w-full">
                                    Continue to Submission
                                </Button>
                            </TabsContent>
                            <TabsContent value="submit" className="space-y-4 pt-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="documentType">Document Type</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="id"
                                                    name="documentType"
                                                    value="id"
                                                    checked={documentType === "id"}
                                                    onChange={handleDocumentTypeChange}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="id" className="text-sm font-normal">
                                                    ID Card
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="passport"
                                                    name="documentType"
                                                    value="passport"
                                                    checked={documentType === "passport"}
                                                    onChange={handleDocumentTypeChange}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="passport" className="text-sm font-normal">
                                                    Passport
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="license"
                                                    name="documentType"
                                                    value="license"
                                                    checked={documentType === "license"}
                                                    onChange={handleDocumentTypeChange}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="license" className="text-sm font-normal">
                                                    Driver's License
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="certification"
                                                    name="documentType"
                                                    value="certification"
                                                    checked={documentType === "certification"}
                                                    onChange={handleDocumentTypeChange}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="certification" className="text-sm font-normal">
                                                    Certification
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document">Upload Document</Label>
                                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                                            {documentFile ? (
                                                <div className="space-y-2">
                                                    <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                                                    <p className="text-sm font-medium">{documentFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setDocumentFile(null)}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                                    <p className="text-sm font-medium">Drag and drop your document here</p>
                                                    <p className="text-xs text-muted-foreground">JPG, PNG, or PDF, max 5MB</p>
                                                    <Button type="button" variant="outline" size="sm" asChild>
                                                        <label htmlFor="file-upload" className="cursor-pointer">
                                                            Browse Files
                                                            <input
                                                                id="file-upload"
                                                                type="file"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                className="sr-only"
                                                                onChange={handleFileChange}
                                                            />
                                                        </label>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Additional Information (Optional)</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Provide any additional information that might help with your verification"
                                            value={message}
                                            onChange={handleMessageChange}
                                            rows={3}
                                        />
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            By submitting this request, you confirm that the information provided is accurate and that you are
                                            the person shown in the document.
                                        </AlertDescription>
                                    </Alert>

                                    <Button type="submit" className="w-full" disabled={loading || !documentFile}>
                                        {loading ? (
                                            <>{uploadLoading ? "Uploading Document..." : "Submitting Request..."}</>
                                        ) : (
                                            "Submit Verification Request"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
