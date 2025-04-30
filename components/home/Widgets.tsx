'use client';
import { Search } from 'lucide-react'
import React from 'react'
import NetworkPage from './network';

function Widgets() {
    return (
        <div className='pl-4 col-span-2 hidden lg:inline mt-2'>

            <div className="mt-2 h-[calc(100vh-4rem)] overflow-y-auto space-y-4 scrollbar-hide relative pr-2">
                <NetworkPage />
            </div>


        </div>
    )
}

export default Widgets