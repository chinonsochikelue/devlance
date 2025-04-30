"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import {
  Globe,
  Github,
  Linkedin,
  MapPin,
  Calendar,
  Star,
  Code,
  ExternalLink,
  FileText,
  MessageSquare,
  SparklesIcon,
  Briefcase,
  Bolt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TechBadges } from "@/components/tech-badges"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Wave from "@/public/wave.json"
import dynamic from "next/dynamic"
import Link from "next/link"
import UserPostCard from "./userPostCard"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import useUser from "@/atoms/userAtom"

// Dynamically import with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

// Mock developer data
const developer = {
  username: "jesschen",
  name: "Jessica Chen",
  role: "Senior Full Stack Developer",
  avatar:
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  coverImage:
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  location: "San Francisco, USA",
  availableFrom: "October 15, 2025",
  hourlyRate: 85,
  rating: 4.9,
  reviews: 47,
  availableForHire: true,
  joinedDate: "June 2023",
  bio: "I'm a passionate full-stack developer with 8+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud architecture on AWS. I love solving complex problems and creating intuitive user experiences.",
  skills: ["React", "Next.js", "Node.js", "TypeScript", "GraphQL", "AWS", "Docker", "PostgreSQL", "MongoDB", "Redis"],
  languages: [
    { name: "English", level: "Native" },
    { name: "Mandarin", level: "Native" },
    { name: "Spanish", level: "Intermediate" },
  ],
  education: [
    { degree: "M.S. Computer Science", school: "Stanford University", year: "2018" },
    { degree: "B.S. Computer Science", school: "UC Berkeley", year: "2016" },
  ],
  experience: [
    {
      role: "Senior Software Engineer",
      company: "TechCorp",
      period: "2020 - Present",
      description:
        "Led development of a microservices architecture serving 2M+ users. Improved API response times by 40%.",
    },
    {
      role: "Full Stack Developer",
      company: "StartupX",
      period: "2018 - 2020",
      description: "Built and scaled the company's main SaaS product from 0 to 50k users.",
    },
  ],
  githubRepos: [
    {
      name: "react-performance-toolkit",
      description: "A collection of tools and utilities for React performance optimization",
      stars: 842,
      language: "TypeScript",
      url: "https://github.com/username/react-performance-toolkit",
    },
    {
      name: "nextjs-ecommerce-starter",
      description: "A fully-featured e-commerce starter template for Next.js with Stripe integration",
      stars: 573,
      language: "TypeScript",
      url: "https://github.com/username/nextjs-ecommerce-starter",
    },
    {
      name: "graphql-subscription-manager",
      description: "A lightweight library for managing GraphQL subscriptions",
      stars: 321,
      language: "JavaScript",
      url: "https://github.com/username/graphql-subscription-manager",
    },
  ],
  links: [
    { type: "website", url: "https://jessicachen.dev", title: "Personal Website" },
    { type: "linkedin", url: "https://linkedin.com/in/jessicachen", title: "LinkedIn Profile" },
    { type: "github", url: "https://github.com/jesschen", title: "GitHub Profile" },
    { type: "resume", url: "/resume.pdf", title: "Download Resume" },
  ],
}

// Mapping of link types to icons
const linkIcons = {
  website: Globe,
  linkedin: Linkedin,
  github: Github,
  resume: FileText,
  dribbble: () => (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
    </svg>
  ),
}

export default function UserData({ user }: { user: any; currentUser: any }) {
  const { user: currentUser, loading } = useUser();
  const [following, setFollowing] = useState(user?.followers?.includes(currentUser?._id))
  const [isLoading, setIsLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(user?.followers?.length || 0)
  const { toast } = useToast()
  console.log("object: ", currentUser?._id + " ", user?._id)

  const handleFollow = async () => {
    if (!currentUser?._id) {
      toast({
        variant: "destructive",
        description: "You need to be logged in to follow users.",
      })
      return
    }

    try {
      setIsLoading(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/follow/${currentUser?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to update follow status")
      }

      const data = await res.json()

      if (data.error) {
        toast({
          variant: "destructive",
          description: data.error || "An error occurred.",
        })
        return
      }

      // Update UI based on the new following state
      if (following) {
        setFollowerCount((prev) => Math.max(0, prev - 1))
        toast({
          description: `You've unfollowed ${user?.name}`,
        })
      } else {
        setFollowerCount((prev) => prev + 1)
        toast({
          description: `You've successfully followed ${user?.name}`,
        })
      }

      // Toggle following state
      setFollowing(!following)
    } catch (error) {
      console.error("Follow error:", error)
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "There was an error updating follow status. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen ">
      {/* Cover image */}
      <Lottie animationData={Wave} autoplay loop className="object-cover -mt-72" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"></div>
      {/* <div className="relative h-60 md:h-96 -mt-52">
        
      </div> */}

      <div className="container max-w-6xl -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar - Profile info */}
          <div className="md:w-1/3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Profile card */}
              <Card className="overflow-hidden mb-6">
                <div className="relative h-40 md:h-48 bg-gradient-to-r from-primary/20 to-primary/5">
                  {/* Profile image */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background overflow-hidden">
                      <Image
                        src={user?.profilePic || developer.avatar}
                        alt={user?.name}
                        width={128}
                        height={128}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 md:pt-20 pb-6 text-center">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-muted-foreground mt-1">{user?.role}</p>
                  <div className="flex items-center justify-center mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user?.location}</span>
                  </div>

                  <p className="text-muted-foreground mt-1 mb-4">{followerCount} followers</p>

                  <div className="flex justify-center gap-2 mb-5">
                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm font-medium flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1 fill-primary" />
                      {developer.rating} ({developer.reviews})
                    </div>

                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm font-medium">
                      ${user?.hourlyRate}/hr
                    </div>
                    {currentUser?._id === user._id && (
                      <Link href={`/profile/updateProfile/${user._id}`}>
                        <div className="cursor-pointer">
                          <Bolt />
                        </div>
                      </Link>
                    )}

                    {currentUser?._id !== user._id && (
                      <Button onClick={handleFollow} disabled={isLoading} variant={following ? "outline" : "default"}>
                        {isLoading ? "Loading..." : following ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">Hire Me</Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts  */}
              <Card className="mb-6 max-h-[500px] overflow-y-auto scrollbar-hide">
                <UserPostCard user={user} />
              </Card>

              {/* Availability */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Available from</span>
                      </div>
                      <span className="font-medium">{developer.availableFrom}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Status</span>
                      </div>
                      {developer.availableForHire ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Available for hire</Badge>
                      ) : (
                        <Badge variant="secondary">Not available</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Links */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {developer.links.map((link) => {
                    const IconComponent = linkIcons[link.type as keyof typeof linkIcons] || ExternalLink
                    return (
                      <Button key={link.url} variant="outline" className="w-full justify-start" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <IconComponent className="h-4 w-4 mr-2" />
                          {link.title}
                        </a>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {developer.languages.map((language) => (
                      <div key={language.name} className="flex justify-between items-center">
                        <span>{language.name}</span>
                        <Badge variant="secondary">{language.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="md:w-2/3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* AI Summary */}
              <Card className="overflow-hidden border-primary/20">
                <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center">
                  <SparklesIcon className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Gemini AI Summary</h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Jessica is a highly skilled senior full-stack developer with extensive experience in React and
                    Node.js ecosystems. She specializes in building scalable web applications with modern frameworks
                    like Next.js and has a strong background in cloud architecture on AWS. Based on her portfolio, she
                    excels at performance optimization and has demonstrable experience scaling applications to handle
                    millions of users. With her technical expertise and experience at both startups and larger
                    companies, she would be an excellent choice for complex web development projects.
                  </p>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{developer.bio}</p>

                  <h3 className="font-medium mb-2">Skills</h3>
                  <TechBadges techs={developer.skills} className="mb-6" />

                  <h3 className="font-medium mb-3">Education</h3>
                  <div className="space-y-3 mb-6">
                    {developer.education.map((edu, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{edu.year}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-medium mb-3">Work Experience</h3>
                  <div className="space-y-4">
                    {developer.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <p className="font-medium">{exp.role}</p>
                          <span className="text-sm text-muted-foreground">{exp.period}</span>
                        </div>
                        <p className="text-sm mb-1">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* GitHub Repositories */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">GitHub Repositories</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
                      <a href={`https://github.com/${developer.username}`} target="_blank" rel="noopener noreferrer">
                        View All
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {developer.githubRepos.map((repo) => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-primary flex items-center">
                          <Code className="h-4 w-4 mr-2" />
                          {repo.name}
                        </h3>
                        <div className="flex items-center text-muted-foreground">
                          <Star className="h-4 w-4 mr-1 fill-muted-foreground" />
                          <span className="text-sm">{repo.stars}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {repo.language}
                      </Badge>
                    </a>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
