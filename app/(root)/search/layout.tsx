import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AuthProvider from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster";

export const dynamic = 'force-dynamic';
export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = cookies()
    const token = await cookieStore.get("jwt")

    if (token) {
        redirect("/home")
    }

    return (
        <AuthProvider>
            <main className="relative py-6 lg:gap-10 lg:py-8">{children}</main>
            <Toaster />
        </AuthProvider>
  )
}