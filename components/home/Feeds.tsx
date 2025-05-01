import { RefreshCcw } from 'lucide-react'
import React from 'react'
import Pings from '../pings/Pings'
import PingBox from './PingBox'

function Feeds() {
  return (
    <div className='col-span-7 lg:col-span-5 p-4 border-x' >
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold tracking-tight scroll-m-20'>Pings</h1>
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