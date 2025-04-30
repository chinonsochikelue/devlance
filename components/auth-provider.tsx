"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, fetchCurrentUser } from "@/lib/auth"

const publicRoutes = ["/", "/login", "/signup"]

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, setUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          const currentUser = await fetchCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          } else if (!publicRoutes.includes(pathname)) {
            router.push("/login")
          }
        } catch (error) {
          console.error("Auth check error:", error)
          if (!publicRoutes.includes(pathname)) {
            router.push("/login")
          }
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [isAuthenticated, pathname, router, setUser])

  if (loading && !isAuthenticated && !publicRoutes.includes(pathname)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return <>{children}</>
}
