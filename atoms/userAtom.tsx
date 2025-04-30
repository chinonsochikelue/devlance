"use client"

import useSWR from "swr"

const fetchUser = async () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user-devlance")
    return stored ? JSON.parse(stored) : null
  }
  return null
}

const useUser = () => {
  const { data, error, isLoading, mutate } = useSWR("user-devlance", fetchUser, {
    fallbackData: null,
    revalidateOnFocus: false, // optimize for localStorage
  })

  return {
    user: data,
    loading: isLoading,
    error,
    setUser: (newUser: any) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("user-threads", JSON.stringify(newUser))
        mutate(newUser, false)
      }
    },
    clearUser: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user-devlance")
        mutate(null, false)
      }
    },
  }
}

export default useUser
