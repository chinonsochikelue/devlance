"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type User = {
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
  languages?: { name: string; proficiency: string }[]
  experience?: {
    title: string
    company: string
    location: string
    from: string
    to: string
    current: boolean
    description: string
  }[]
  education?: {
    school: string
    degree: string
    fieldOfStudy: string
    from: string
    to: string
    current: boolean
    description: string
  }[]
  githubRepos?: {
    id: string
    name: string
    html_url: string
    description: string
    language: string
  }[]
  links?: {
    website?: string
    twitter?: string
    github?: string
    linkedin?: string
  }
}

type AuthStore = {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    // Get the user ID from the cookie or localStorage if available
    const authStore = JSON.parse(localStorage.getItem("auth-storage") || "{}")
    const userId = authStore?.state?.user?._id

    if (!userId) return null

    const res = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
      credentials: "include",
    })

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export const logout = async (): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:5000/api/users/logout", {
      method: "POST",
      credentials: "include",
    })

    return res.ok
  } catch (error) {
    console.error("Error logging out:", error)
    return false
  }
}
