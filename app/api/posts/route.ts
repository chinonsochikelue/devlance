import { NextResponse } from "next/server"
import type { Post } from "@/lib/types"

// This is a mock API endpoint that would normally fetch data from a database
export async function GET() {
    // Mock data
    const posts: Post[] = [
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
        },
        // Add more mock posts as needed
    ]

    return NextResponse.json(posts)
}
