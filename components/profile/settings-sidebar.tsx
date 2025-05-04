"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { User, Github, BookOpen, Briefcase, LinkIcon, Settings, Globe, Clock, Code, Shield } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export default function SettingsSidebar({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const items = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "Experience",
      href: "/settings/experience",
      icon: Briefcase,
    },
    {
      title: "Education",
      href: "/settings/education",
      icon: BookOpen,
    },
    {
      title: "Skills",
      href: "/settings/skills",
      icon: Code,
    },
    {
      title: "Languages",
      href: "/settings/languages",
      icon: Globe,
    },
    {
      title: "Links",
      href: "/settings/links",
      icon: LinkIcon,
    },
    {
      title: "GitHub",
      href: "/settings/github",
      icon: Github,
    },
    {
      title: "Availability",
      href: "/settings/availability",
      icon: Clock,
    },
    {
      title: "Verification",
      href: "/settings/verification",
      icon: Shield,
    },
    {
      title: "Account",
      href: "/settings/account",
      icon: Settings,
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
