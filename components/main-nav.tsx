"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  
  return (
    <div className="hidden md:flex md:gap-6 lg:gap-10">
      <Link
        href="/devs"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/devs" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Browse Devs
      </Link>
      <Link
        href="/jobs"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/jobs" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Post Job
      </Link>
      <Link
        href="/messages"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/messages" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Messages
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
    </div>
  )
}