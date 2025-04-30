'use client'
import Feeds from '@/components/home/Feeds'
import SideBar from '@/components/home/SideBar'
import Widgets from '@/components/home/Widgets'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  console.log(user)

  return (
    <div className='max-h-screen overflow-hidden'>
      <div className='grid grid-cols-9'>
        <SideBar />
        <Feeds />
        <Widgets />
      </div>
    </div>
  );
}
