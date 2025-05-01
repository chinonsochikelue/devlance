"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchLinkMetadata } from "@/lib/api"
import { motion } from "framer-motion"

interface LinkPreviewProps {
  url: string
}

interface LinkMetadata {
  title: string
  description: string
  image: string
  domain: string
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const getMetadata = async () => {
      try {
        setLoading(true)
        const data = await fetchLinkMetadata(url)
        setMetadata(data)
        setError(false)
      } catch (err) {
        console.error("Failed to fetch link metadata:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      getMetadata()
    }
  }, [url])

  if (loading) {
    return (
      <Card className="mt-3 overflow-hidden border border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="h-40 w-full md:w-1/3" />
            <div className="p-3 flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !metadata) {
    return (
      <Card className="mt-3 overflow-hidden border border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <p className="text-sm">{url}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="mt-3 overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {metadata.image && (
                <div className="md:w-1/3 h-40 overflow-hidden">
                  <img
                    src={metadata.image || "/placeholder.svg"}
                    alt={metadata.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3 flex-1">
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 mr-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-[8px] font-bold">
                    {metadata.domain.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs text-muted-foreground">{metadata.domain}</p>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-purple-600 transition-colors">
                  {metadata.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
              </div>
            </div>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  )
}
