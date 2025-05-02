// Import the User type from auth.ts
import type { User as AuthUser } from "@/lib/auth"

// Use the imported User type or define a simplified version for posts
export type User = AuthUser

export interface Reply {
  userId: string
  text: string
  userProfilePic: string
  username: string
  _id: string
}

export interface Post {
  _id: string
  postedBy: string // This is just the user ID
  text: string
  img?: string
  likes: string[]
  replies: Reply[]
  createdAt: string
  updatedAt: string
  parentId?: string
  community?: string
  __v?: number
}

export interface PostWithUser extends Omit<Post, 'postedBy'> {
  postedBy: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
