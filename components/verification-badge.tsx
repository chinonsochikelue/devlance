import { CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerificationBadgeProps {
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export default function VerificationBadge({ size = "md", showTooltip = true }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const badge = <CheckCircle2 className={`${sizeClasses[size]} text-blue-500 fill-blue-100`} />

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Verified Profile</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
