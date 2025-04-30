import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LandingPage from "./landing/page"

export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get("jwt")

  if (token) {
    redirect("/home")
  }

  return <LandingPage />
}