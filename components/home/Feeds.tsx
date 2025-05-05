import { RefreshCcw, Search } from 'lucide-react'
import React from 'react'
import Pings from '../pings/Pings'
import PingBox from './PingBox'
import { useRouter } from "next/navigation"

function Feeds() {
  const router = useRouter()
  return (
    <div className='col-span-7 lg:col-span-5 p-4 border-x' >
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold tracking-tight scroll-m-20'>Pings</h1>
        <div className="hidden md:flex md:w-1/3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = (e.target as HTMLInputElement).value
                  if (query.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                  }
                }
              }}
            />
          </div>
        </div>
        <RefreshCcw className='h-8 w-8 cursor-pointer transition-all duration-500 ease-out hover:rotate-150 active:scale-125 text-blue-500' />
      </div>

      {/* PingBox */}

      <div className="mt-2 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden  scrollbar-hide w-full p-2">
        <div className='flex flex-col space-y-4 mt-4'>
          <PingBox />
        </div>
        <div className='space-y-4 mt-4'>
          <Pings />
        </div>
      </div>
    </div>
  )
}

export default Feeds