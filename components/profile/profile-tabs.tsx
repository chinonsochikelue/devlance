"use client"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Code, BookOpen, Briefcase, MessageSquare } from "lucide-react"

export default function ProfileTabs() {
    const params = useParams()
    const pathname = usePathname()
    const { id } = params

    const tabs = [
        {
            name: "Posts",
            href: `/profile/${id}`,
            icon: MessageSquare,
            exact: true,
        },
        {
            name: "Experience",
            href: `/profile/${id}/experience`,
            icon: Briefcase,
        },
        {
            name: "Education",
            href: `/profile/${id}/education`,
            icon: BookOpen,
        },
        {
            name: "GitHub",
            href: `/profile/${id}/github`,
            icon: Code,
        },
        {
            name: "About",
            href: `/profile/${id}/about`,
            icon: User,
        },
    ]

    const isActive = (tab: (typeof tabs)[0]) => {
        if (tab.exact) {
            return pathname === tab.href
        }
        return pathname.startsWith(tab.href)
    }

    return (
        <div className="border-b mb-6">
            <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                            isActive(tab)
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}
