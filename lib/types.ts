export interface User {
    id: string
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  
  export interface Comment {
    id: string
    user: User
    content: string
    timestamp: string
  }
  
  export interface Post {
    id: string
    user: User
    content: string
    timestamp: string
    likes: number
    comments: number
    shares: number
    isLiked: boolean
    image?: string
    video?: string
    link?: string
    tags?: string[]
    commentsList?: Comment[]
  }
  