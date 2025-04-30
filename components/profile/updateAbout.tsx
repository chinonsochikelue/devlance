'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import Image from "next/image"
import { motion } from "framer-motion"
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls, Cloud } from '@react-three/drei'
import { Suspense, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import useUser from "@/atoms/userAtom"


interface User {
    username?: string;
    stack?: string;
    email?: string;
    location?: string;
    bio?: string;
}

interface FormData {
    name: string;
    stack: string;
    email: string;
    location: string;
    bio: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface Errors extends Partial<FormData> { }


const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.15,
            duration: 0.8,
            ease: "easeOut",
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    focus: { scale: 1.05 },
}


export default function UpdateProfile() {
    const { user, setUser } = useUser();
    const [mounted, setMounted] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>("")
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: user?.username || "",
        stack: user?.role || "",
        email: user?.email || "",
        location: user?.location || "",
        bio: user?.bio || "",
        profilePic: user?.profilePic || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState({
        name: "",
        stack: "",
        email: "",
        location: "",
        bio: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const validateForm = () => {
        let formErrors: Partial<FormData> = {};
        let valid = true;

        // Ensure default credentials are used when fields are left empty
        const finalFormData = {
            name: formData.name.trim() || user?.username || "",
            stack: formData.stack.trim() || user?.stack || "",
            email: formData.email.trim() || user?.email || "",
            location: formData.location.trim() || user?.location || "",
            bio: formData.bio.trim() || user?.bio || "",
            currentPassword: formData.currentPassword.trim(),
            newPassword: formData.newPassword.trim(),
            confirmPassword: formData.confirmPassword.trim(),
        };

        // Validate Name
        if (!finalFormData.name) {
            formErrors.name = "Name is required";
            valid = false;
        }

        // Validate Email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(finalFormData.email)) {
            formErrors.email = "Enter a valid email address";
            valid = false;
        }

        // Validate Password
        if (finalFormData.newPassword && finalFormData.newPassword.length < 6) {
            formErrors.newPassword = "Password must be at least 6 characters";
            valid = false;
        }

        // Confirm Password Match
        if (finalFormData.newPassword !== finalFormData.confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match";
            valid = false;
        }

        setErrors(formErrors);
        setFormData(finalFormData);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (validateForm()) {
            // Submit the form data to the server or perform any action
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/update/${user?._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",    
                    },
                    // credentials: "include",
                    body: JSON.stringify({ ...formData, profilePic: imageUrl }),
                })
                const data = await res.json();

                setUser(data);
                localStorage.setItem("user-devlance", JSON.stringify(data));
                toast({
                    title: "Profile updated successfully",
                    description: "Your profile has been updated.",
                    variant: "default",
                })
                window.location.href = "/";
            }
            catch (error) {
                toast({
                    title: "Error updating profile",
                    description: "There was an error updating your profile: " + error,
                    variant: "destructive",
                })
            }
            console.log("Form submitted", formData)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setImageUrl(reader.result);
                setFormData({ ...formData, profilePic: imageUrl });
            }
            reader.readAsDataURL(file);
        } else {
            toast({
                title: "Invalid file type",
                description: "Please select an image file.",
                variant: "destructive",
            })
            setImageUrl(null);
            setFormData({ ...formData, profilePic: "" });
        }
    }

    return (
        <div className="absolute inset-0 flex">
            {/* 🌌 Nebula and Comet Drive Background */}
            <div className="fixed w-full h-full overflow-hidden">
                <Canvas className="absolute inset-0 w-full" camera={{ position: [0, 0, 10], fov: 75 }}>
                    <Suspense fallback={null}>
                        {/* Stars */}
                        <Stars
                            radius={200}
                            depth={60}
                            count={8000}
                            factor={4}
                            saturation={0}
                            fade
                            speed={2}
                        />

                        {/* Nebula Clouds */}
                        <Cloud position={[0, 0, -10]} scale={[10, 5, 5]} color="purple" opacity={0.5}>
                            <meshStandardMaterial color="purple" opacity={0.5} transparent />
                        </Cloud>

                        {/* Comet drive effect: Fast rotating Stars */}
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                    </Suspense>
                </Canvas>
            </div>

            {/* 🛸 Foreground Update Profile Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="absolute inset-0 top-4 px-4 sm:px-6 py-8 space-y-10"
            >
                {/* Header */}
                <motion.header variants={itemVariants} className="space-y-4">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-5"
                    >
                        <motion.div
                            className="relative"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <Image
                                src={imageUrl || user?.profilePic || "https://github.com/shadcn.png"}
                                alt={user?.username + " profile picture" || "Profile Picture"}
                                width={96}
                                height={96}
                                className="rounded-full border-2 border-primary/40 shadow-lg"
                                style={{ aspectRatio: "96/96", objectFit: "cover" }}
                                priority
                            />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold text-primary">{user?.username || "Username"}</h1>
                            <Button variant="outline" size="sm" className="border-dashed cursor-pointer" >
                                <Label htmlFor="picture"> Change Photo</Label>
                            </Button>
                            <Input id="picture" type="file" className="hidden" onChange={handleFileChange} />
                        </div>
                    </motion.div>
                </motion.header>

                {/* Form Section */}
                <motion.div variants={containerVariants} className="space-y-8">
                    {/* Profile Card */}
                    <motion.div variants={itemVariants}>
                        <Card className="hover:shadow-2xl transition-shadow duration-300 bg-transparent rounded-xl">
                            <CardContent className="space-y-6 py-6">
                                {/* 🛠 Wrap fields inside a grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: "Name", id: "name", placeholder: user?.username, error: errors.name },
                                        { label: "Stack", id: "stack", placeholder: "E.g. Senior Full Stack Developer", error: errors.stack },
                                        { label: "Email", id: "email", placeholder: "E.g. jane@example.com", error: errors.email },
                                        { label: "Location", id: "location", placeholder: "E.g. 'Onitsha, NG'", error: errors.location },
                                    ].map((field, idx) => (
                                        <motion.div
                                            key={field.id}
                                            variants={itemVariants}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor={field.id}>{field.label}</Label>
                                            <Input
                                                id={field.id}
                                                placeholder={field.placeholder}
                                                value={formData[field.id]}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            />
                                            {field.error && <span className="text-red-500 text-sm">{field.error}</span>}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Bio stays full width */}
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="bio">Biography</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself..."
                                        className="min-h-[120px]"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                    {errors.bio && <span className="text-red-500 text-sm">{errors.bio}</span>}
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Password Card */}
                    <motion.div variants={itemVariants}>
                        <Card className="hover:shadow-2xl transition-shadow duration-300 bg-transparent rounded-xl">
                            <CardHeader>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold">Change Password</h2>
                                    <p className="text-sm text-muted-foreground">
                                        For your security, please don't share your password with others.
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: "Current Password", id: "currentPassword", error: errors.currentPassword },
                                    { label: "New Password", id: "newPassword", error: errors.newPassword },
                                    { label: "Confirm New Password", id: "confirmPassword", error: errors.confirmPassword },
                                ].map((field, idx) => (
                                    <motion.div key={field.id} variants={itemVariants} className="space-y-2">
                                        <Label htmlFor={field.id}>{field.label}</Label>
                                        <Input
                                            type="password"
                                            id={field.id}
                                            value={formData[field.id]}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                        />
                                        {field.error && <span className="text-red-500 text-sm">{field.error}</span>}
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Save Changes Button */}
                <motion.div
                    className="flex justify-end pt-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Button size="lg" className="font-bold shadow-md mb-6 mr-12 cursor-pointer" onClick={handleSubmit} disabled={Object.values(errors).some((error) => error)}>
                        Save Changes
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}
