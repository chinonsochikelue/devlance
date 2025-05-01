import type { Post } from "./types"

// Helper function for making authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Ensure credentials are included to send cookies
    const fetchOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  
    try {
      const response = await fetch(url, fetchOptions)
  
      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        // You could redirect to login or refresh token here
        console.error("Authentication error: Please log in again")
        // Could use router.push('/login') here if needed
      }
  
      return response
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }
  

  // This is a mock API function that would normally fetch data from a backend
export async function fetchPosts(): Promise<Post[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: "1",
      user: {
        id: "recordingacademy",
        name: "Recording Academy",
        username: "recordingacademy",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      content:
        "🎵 The #GRAMMYs are almost here! Get ready for an unforgettable night of music, red carpet fashion, and show-stopping performances.\n\nFollow along here and pin the feed to your home so you don't miss a thing! ✨✨",
      timestamp: "17h",
      likes: 99,
      comments: 7,
      shares: 11,
      isLiked: false,
      tags: ["GRAMMYs"],
      commentsList: [
        {
          id: "c1",
          user: {
            id: "musicfan",
            name: "Music Fan",
            username: "musicfan",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: false,
          },
          content: "Can't wait for the performances! Who's performing this year?",
          timestamp: "16h",
        },
        {
          id: "c2",
          user: {
            id: "grammylover",
            name: "Grammy Lover",
            username: "grammylover",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: false,
          },
          content: "So excited to see all the red carpet looks! 👗✨",
          timestamp: "15h",
        },
      ],
    },
    {
      id: "2",
      user: {
        id: "recordingacademy",
        name: "Recording Academy",
        username: "recordingacademy",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      content:
        "We've got your exclusive access to the GRAMMYs red carpet on Music's Biggest Night.\n\n🎵 From interviews with GRAMMY nominees to backstage moments, tune in on Sunday, Feb. 2 at 6-8 PM ET / 3-5 PM PT and join us to see #GRAMMYs live from the red carpet:",
      timestamp: "17h",
      likes: 45,
      comments: 3,
      shares: 5,
      isLiked: false,
      link: "https://grm.my/3ChiZi",
      tags: ["GRAMMYs"],
      commentsList: [
        {
          id: "c3",
          user: {
            id: "musicinsider",
            name: "Music Insider",
            username: "musicinsider",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: true,
          },
          content: "Will there be a livestream for international viewers?",
          timestamp: "16h",
        },
      ],
    },
    {
      id: "3",
      user: {
        id: "mattnavarra",
        name: "Matt Navarra",
        username: "mattnavarra",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      content: "Threads Marketing Guide for Businesses and Creators 2024\n\nThanks for the mention @metricoolapp",
      timestamp: "now",
      likes: 32,
      comments: 5,
      shares: 8,
      isLiked: true,
      link: "https://metricool.com/threads-marketing-guide/",
      tags: ["socialmediamarketing"],
      commentsList: [
        {
          id: "c4",
          user: {
            id: "socialexpert",
            name: "Social Media Expert",
            username: "socialexpert",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: false,
          },
          content: "Great resource! Thanks for sharing this guide.",
          timestamp: "10m",
        },
        {
          id: "c5",
          user: {
            id: "contentcreator",
            name: "Content Creator",
            username: "contentcreator",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: false,
          },
          content: "Just what I needed for my business strategy!",
          timestamp: "5m",
        },
      ],
    },
    {
      id: "4",
      user: {
        id: "lindseygamble",
        name: "Lindsey Gamble",
        username: "lindseygamble_",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: false,
      },
      content: "🚨 NEW 🚨 TikTok now allows you to upload a custom cover/thumbnail for your videos.",
      timestamp: "7m",
      likes: 15,
      comments: 2,
      shares: 3,
      isLiked: false,
      image: "/placeholder.svg?height=300&width=400",
      commentsList: [
        {
          id: "c6",
          user: {
            id: "tiktoker",
            name: "TikTok Creator",
            username: "tiktoker",
            avatar: "/placeholder.svg?height=40&width=40",
            verified: false,
          },
          content: "Finally! This is a game-changer for content creators.",
          timestamp: "5m",
        },
      ],
    },
  ]
}

// This function would normally make a server request to fetch metadata
export async function fetchLinkMetadata(url: string): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock data based on URL
  if (url.includes("grm.my")) {
    return {
      title: "GRAMMY Awards Red Carpet Live Stream",
      description: "Watch exclusive interviews and behind-the-scenes moments from the GRAMMY Awards red carpet.",
      image: "/placeholder.svg?height=200&width=300",
      domain: "grammys.com",
    }
  } else if (url.includes("metricool.com")) {
    return {
      title: "2024 Threads Marketing Guide for Businesses and Creators",
      description:
        "Learn how to leverage Threads for your business or personal brand with our comprehensive marketing guide.",
      image: "/placeholder.svg?height=200&width=300",
      domain: "metricool.com",
    }
  } else {
    return {
      title: "Link Preview",
      description: "This is a preview of the linked content.",
      image: "/placeholder.svg?height=200&width=300",
      domain: new URL(url).hostname,
    }
  }
}