import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import SettingsSidebar from "@/components/profile/settings-sidebar"
import AuthProvider from "@/components/auth-provider"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get("jwt")

  if (token) {
    redirect("/home")
  }

  return (
    <AuthProvider>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
          <SettingsSidebar />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </AuthProvider>
  )
}
