"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import {
  Globe,
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
  GitFork,
  GraduationCap,
} from "lucide-react"
import { SocialIcon } from 'react-social-icons'
import { Button } from "@/components/ui/button"
import { TechBadges } from "@/components/tech-badges"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Wave from "@/public/wave.json"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import useUser from "@/atoms/userAtom"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserPostCard from "@/components/profile/userPostCard"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import ProfileCompletionMeter from "@/components/profile/profile-completion-meter"
import { FaGithub, FaLinkedin, FaGlobe, FaTwitter, FaDribbble, FaBehance } from "react-icons/fa";
import { format } from "date-fns"
import SkillEndorsement from "@/components/profile/skill-endorsement"
import SkillEndorsements from "@/components/profile/skill-endorsement"
import ResumeExport from "@/components/profile/resume-export"
import MessageButton from "@/components/message/message-button"

// Dynamically import with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type User = {
  _id: string
  name: string
  username: string
  email: string
  bio?: string
  profilePic?: string
  coverImage?: string
  followers?: string[]
  following?: string[]
  role?: string
  location?: string
  availableFrom?: string
  available?: boolean
  hourlyRate?: number
  joinedDate?: string
  languages?: { name: string; proficiency: string }[]
  experience?: Experience[]
  education?: Education[]
  skills?: {
    name: string
    level: string
    endorsements?: {
      userId: string
      name: string
      profilePic?: string
      timestamp: string
    }[]
  }[]
  githubUsername?: string
  githubRepos?: Repository[]
  links?: {
    website?: string
    twitter?: string
    github?: string
    linkedin?: string
  }
}

type Education = {
  degree: string
  school: string
  year: string
}

type Experience = {
  role: string
  company: string
  period: string
  description: string
}

type Post = {
  _id: string
  text: string
  user: {
    _id: string
    name: string
    username: string
    profilePic: string
  }
  createdAt: string
  likes: string[]
  replies: {
    _id: string
    text: string
    userId: string
    username: string
    userProfilePic: string
    createdAt: string
  }[]
  image?: string
}

type Repository = {
  id: string
  name: string
  html_url: string
  description: string
  language: string
  stargazers_count?: number
  forks_count?: number
  private: boolean
  updated_at: string
}

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

const detectLinkType = (url: string): keyof typeof linkIcons => {
  if (!url) return "website";

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("github.com")) return "github";
  if (lowerUrl.includes("linkedin.com")) return "linkedin";
  if (lowerUrl.includes("behance.net")) return "behance";
  if (lowerUrl.includes("dribbble.com")) return "dribbble";
  if (lowerUrl.includes("twitter.com")) return "twitter";

  return "website"; // default/fallback
};

// Mapping of link types to icons
const linkIcons = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  dribbble: FaDribbble,
  behance: FaBehance,
  website: FaGlobe,
};

export default function UserData() {

  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [expanded, setExpanded] = useState(false);
  const [showEndorsements, setShowEndorsements] = useState(false)

  const limit = 200;


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/${id}`, {
          credentials: "include",
        })
        const data = await res.json()
        setUser(data)
        setFollowersCount(data.followers?.length || 0)

        if (currentUser) {
          setIsFollowing(data.followers?.includes(currentUser._id) || false)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
    const fetchUserPosts = async () => {
      console.log(id)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pings/user/${id}`, {
          credentials: "include",
        })
        const data = await res.json()
        console.log("data: ", data)
        setPosts(data)
      } catch (error) {
        console.error("Error fetching user posts:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
      fetchUserPosts()
    }
  }, [id, currentUser])

  const handleFollow = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/follow/${id}`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        setIsFollowing(!isFollowing)
        setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1)
      }
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      "C#": "bg-purple-500",
      PHP: "bg-indigo-500",
      Ruby: "bg-pink-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      Swift: "bg-rose-500",
      Kotlin: "bg-amber-500",
      Dart: "bg-teal-500",
      HTML: "bg-red-600",
      CSS: "bg-blue-600",
    }

    return colors[language] || "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-48 rounded-lg bg-muted"></div>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-muted"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-muted"></div>
            <div className="h-4 w-32 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">User not found</p>
      </div>
    )
  }


  const handleEndorsementChange = () => {
    fetchProfile()
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case "native":
      case "expert":
        return "bg-green-100 text-green-800"
      case "fluent":
      case "advanced":
        return "bg-blue-100 text-blue-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "beginner":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOwnProfile = currentUser?._id === user._id

  const isLong = user?.bio?.length > limit;
  const displayedBio = expanded || !isLong ? user?.bio : `${user?.bio.slice(0, limit)}...`;

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
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={
                            user.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                          }
                          alt={user.name}
                          style={{
                            aspectRatio: "96/96",
                            objectFit: "cover"
                          }}
                        />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 md:pt-20 pb-6 flex flex-col items-center justify-center text-center animate-fade-in">

                  <div className="mt-10 flex flex-col items-center animate-slide-up">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {user.role && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{user.role}</span>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-4">
                      <p className="text-sm">
                        <span className="font-medium">{followersCount}</span> followers
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{user.following?.length || 0}</span> following
                      </p>

                      {currentUser && currentUser._id !== user._id && (
                        <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollow}>
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center gap-3 animate-fade-in-up">
                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm font-medium flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1 fill-primary" />
                      {developer.rating} ({developer.reviews})
                    </div>

                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm font-medium">
                      ${user?.hourlyRate}/hr
                    </div>

                    {currentUser && currentUser._id === user._id && (
                      <Link href="/settings">
                        <div className="cursor-pointer">
                          <Bolt />
                        </div>
                      </Link>
                    )}

                  </div>

                  <div className="mt-6 w-full space-y-2 animate-fade-in">
                    {user.joinedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined {format(new Date(user.joinedDate), "MMMM yyyy")}</span>
                      </div>
                    )}
                    <Button className="w-full">Hire Me</Button>
                    {currentUser && currentUser._id !== user._id && (
                      <>
                        <MessageButton userId={user._id} username={user.username} />
                      </>
                    )}
                    {/* Resume Export */}
                    {(isOwnProfile || currentUser) && (
                      <div className="mt-4">
                        <ResumeExport userId={user._id} isOwnProfile={isOwnProfile} />
                      </div>
                    )}
                    <ProfileCompletionMeter />
                  </div>
                </CardContent>

              </Card>

              {/* Posts  */}
              <Tabs defaultValue="posts" className="mt-6">
                <Card className="mb-6 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {posts.length > 0 ? (
                    posts.map((post) => <UserPostCard user={user} key={post._id} post={post} />)
                  ) : (
                    <div className="rounded-lg border p-8 text-center">
                      <h3 className="text-lg font-medium">No posts yet</h3>
                      <p className="text-muted-foreground mt-2">
                        {user._id === currentUser?._id
                          ? "Share your first post with the community!"
                          : `${user.name} hasn't posted anything yet.`}
                      </p>
                    </div>
                  )}
                </Card>
              </Tabs>

              {/* Availability */}
              {user?.available && user?.availableFrom ? (
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
                        <span className="font-medium">{user.availableFrom}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Status</span>
                        </div>
                        {user.available ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Available for hire</Badge>
                        ) : (
                          <Badge variant="secondary">Not available</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <></>
              )}

              {/* Links */}
              {user.links && user.links.length > 0 ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.links.map((link) => {
                      const type = detectLinkType(link.url);
                      const IconComponent = linkIcons[type] || ExternalLink;

                      return (
                        <Button key={link.url} variant="outline" className="w-full justify-start" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <IconComponent className="h-4 w-4 mr-2" />
                            {link.title || link.url}
                          </a>
                        </Button>
                      );
                    })}

                  </CardContent>
                </Card>
              ) : (<></>
              )}


              {/* Languages */}
              {user.languages && user.languages.length > 0 ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.languages.map((language) => (
                        <div key={language.name} className="flex justify-between items-center">
                          <span>{language.name}</span>
                          <Badge variant="secondary">{language.level || "Unknown"}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                </>
              )}

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
                  <p className="text-muted-foreground mb-4"> {displayedBio}
                    {isLong && (
                      <button
                        className="ml-2 text-primary underline text-sm"
                        onClick={() => setExpanded(!expanded)}
                      >
                        {expanded ? "See less" : "See more"}
                      </button>
                    )}</p>

                  {user.skills && user.skills.length > 0 && (
                    <Button variant="outline" onClick={() => setShowEndorsements(!showEndorsements)}>
                      {showEndorsements ? "Hide Skills" : "View Skills"}
                    </Button>
                  )}

                  {/* Skills and Endorsements */}
                  {showEndorsements && user.skills && user.skills.length > 0 && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/10">
                      <h3 className="text-lg font-medium mb-4">Skills & Endorsements</h3>
                      <SkillEndorsements userId={user._id} userSkills={user.skills} isOwnProfile={isOwnProfile} />
                    </div>
                  )}

                  {/* {user.skills && user.skills.length > 0 && (
                    <>
                      <code className="h-5 w-5" />
                      <h3 className="font-medium mb-3 text-2xl">Skills</h3>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, index) => (
                              <SkillEndorsement userId={user._id} key={index} skills={user.skills} onEndorsementChange={handleEndorsementChange} />
                          ))}
                        </div>
                      </CardContent>
                    </>
                  )} */}

                  {user.education && user.education.length > 0 ? (
                    <>
                      <h3 className="font-medium mb-3 text-2xl">Education</h3>
                      <div className="space-y-3 mb-6">
                        {user.education.map((edu, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-muted-foreground">{edu.school}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h2 className="text-2xl font-bold">No education listed</h2>
                      <p className="text-muted-foreground mt-2">
                        {user._id === id
                          ? "Add your educational background in settings"
                          : `${user.name} hasn't added any education yet`}
                      </p>
                    </div>
                  )}

                  {user.experience && user.experience.length > 0 ? (
                    <>
                      <h3 className="font-medium mb-3 text-2xl">Work Experience</h3>
                      <div className="space-y-4">
                        {user.experience.map((exp, index) => (
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
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h2 className="text-2xl font-bold">No experience listed</h2>
                      <p className="text-muted-foreground mt-2">
                        {user._id === id
                          ? "Add your professional experience in settings"
                          : `${user.name} hasn't added any experience yet`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* GitHub Repositories */}
              {user.githubRepos && user.githubRepos.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">GitHub Repositories</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
                        <a
                          href={`https://github.com/${user.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View All
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.githubRepos.map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-primary flex items-center">
                            <Code className="h-4 w-4 mr-2" />
                            {repo.name}
                          </h3>
                          {repo.stargazers_count !== undefined && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Star className="h-4 w-4" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              <span className={`h-3 w-3 rounded-full mr-2 ${getLanguageColor(repo.language)}`}></span>
                              {repo.language}
                            </Badge>
                          )}
                          {repo.forks_count !== undefined && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <GitFork className="h-4 w-4" />
                              <span>{repo.forks_count}</span>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
