import React, { SVGProps } from 'react'
interface SideBarRowProps {
    Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
    title: string
    selected?: boolean  // optional prop
    onClick?: () => void // optional prop
}

function SideBarRow({Icon, title, selected, onClick}: SideBarRowProps) {
  return (
    <div onClick={onClick} className={`flex max-w-fit items-center space-x-2 px-4 py-3 cursor-pointer rounded-full hover:bg-blue-200 transition-all duration-200 group ${selected ? 'bg-gray-200' : ''}`}>
      <Icon className="h-6 w-6" />
      <span className="group-hover:text-blue-500 ml-2 hidden md:inline-flex text-base font-light lg:text-xl">{title}</span>
      
    </div>
  )
}

export default SideBarRow
