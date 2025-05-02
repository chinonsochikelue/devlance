import type { Post, Reply, User, PostWithUser } from "./types"

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


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // Cache for user data to avoid repeated fetches
  const userCache: Record<string, User> = {}
  
  // Generic fetch function with error handling
  async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      credentials: "include", // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  
    const data = await response.json()
  
    if (!response.ok) {
      throw new Error(data.error || "Something went wrong")
    }
  
    return data
  }
  
  // Fetch user by ID
  export async function fetchUser(userId: string): Promise<User> {
    // Return from cache if available
    if (userCache[userId]) {
      return userCache[userId]
    }
    
    try {
      const user = await fetchAPI<User>(`/users/profile/${userId}`)
      // Cache the user data
      userCache[userId] = user
      return user
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      // Return a placeholder user if we can't fetch the real one
      return {
        _id: userId,
        name: "Unknown User",
        username: "unknown",
        email: "",
        profilePic: "/placeholder.svg?height=40&width=40"
      }
    }
  }
  
  // Fetch feed posts (requires authentication)
  export async function fetchFeedPosts(): Promise<Post[]> {
    try {
      return await fetchAPI<Post[]>("/pings/feed")
    } catch (error) {
      console.error("Error fetching feed posts:", error)
      throw error
    }
  }
  
  // Fetch posts with user data
  export async function fetchFeedPostsWithUsers(): Promise<PostWithUser[]> {
    try {
      const posts = await fetchFeedPosts()
      
      // Fetch unique user IDs
      const userIds = [...new Set(posts.map(post => post.postedBy))]
      
      // Fetch all users in parallel
      const userPromises = userIds.map(userId => fetchUser(userId))
      const users = await Promise.all(userPromises)
      
      // Create a map of user IDs to user objects
      const userMap = users.reduce((map, user) => {
        map[user._id] = user
        return map
      }, {} as Record<string, User>)
      
      // Combine posts with user data
      return posts.map(post => ({
        ...post,
        postedBy: userMap[post.postedBy] || {
          _id: post.postedBy,
          name: "Unknown User",
          username: "unknown",
          email: "",
          profilePic: "/placeholder.svg?height=40&width=40"
        }
      }))
    } catch (error) {
      console.error("Error fetching feed posts with users:", error)
      throw error
    }
  }
  
  // Fetch posts by a specific user
  export async function fetchUserPosts(username: string): Promise<Post[]> {
    try {
      return await fetchAPI<Post[]>(`/posts/user/${username}`)
    } catch (error) {
      console.error(`Error fetching posts for user ${username}:`, error)
      throw error
    }
  }
  
  // Fetch a single post by ID
  export async function fetchPost(postId: string): Promise<Post> {
    try {
      return await fetchAPI<Post>(`/posts/${postId}`)
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error)
      throw error
    }
  }
  
  
  // Like or unlike a post
  export async function likeUnlikePost(postId: string): Promise<{ message: string }> {
    try {
      return await fetchAPI<{ message: string }>(`/pings/like/${postId}`, {
        method: "PUT",
      })
    } catch (error) {
      console.error(`Error liking/unliking post ${postId}:`, error)
      throw error
    }
  }
  
  // Reply to a post
  export async function replyToPost(postId: string, text: string): Promise<Reply> {
    try {
      return await fetchAPI<Reply>(`/pings/reply/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ text }),
      })
    } catch (error) {
      console.error(`Error replying to post ${postId}:`, error)
      throw error
    }
  }
  
  // Delete a post
  export async function deletePost(postId: string): Promise<{ message: string }> {
    try {
      return await fetchAPI<{ message: string }>(`/pings/${postId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error)
      throw error
    }
  }
  
  // Format timestamp to relative time (e.g., "2h ago")
  export function formatTimestamp(timestamp: string): string {
    const now = new Date()
    const postDate = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`
    }
  
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    }
  
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h`
    }
  
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d`
    }
  
    return postDate.toLocaleDateString()
  }
  
  export async function fetchLinkMetadata(url: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/link-preview?url=${url}`)
      if (!response.ok) {
        throw new Error("Failed to fetch link metadata")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching link metadata:", error)
      throw error
    }
  }
  