import { CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function VerifiedBadge({ className, size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle className={`text-blue-500 ${sizeClasses[size]} ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Verified Account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
