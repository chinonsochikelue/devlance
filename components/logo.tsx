import Link from 'next/link'
import { Code2 } from 'lucide-react'

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Code2 className="h-8 w-8 text-primary" />
      <span className="font-bold text-xl hidden lg:inline-flex">Devlance</span>
    </Link>
  )
}