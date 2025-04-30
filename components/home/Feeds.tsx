import { RefreshCcw } from 'lucide-react'
import React from 'react'
import PingBox from './PingBox'
import Pings from './Pings'

function Feeds() {
  return (
    <div className='col-span-7 lg:col-span-5 p-4 border-x' >
      <div className='flex items-center justify-between'>
      <h1 className='text-2xl font-extrabold tracking-tight scroll-m-20'>Pings</h1>
      <RefreshCcw className='h-8 w-8 cursor-pointer transition-all duration-500 ease-out hover:rotate-150 active:scale-125 text-blue-500' />
      </div>

      {/* PingBox */}

        <div className='flex flex-col space-y-4 mt-4'>
            <PingBox />
        </div>
            {/* Add more PingBox components as needed */}
            <div>
                <Pings />
            </div>
    </div>
  )
}

export default Feeds