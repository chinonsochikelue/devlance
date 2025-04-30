import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TechBadgesProps = {
  techs: string[]
  className?: string
  onClick?: (tech: string) => void
  active?: string
  limit?: number
}

export function TechBadges({ 
  techs, 
  className, 
  onClick, 
  active, 
  limit 
}: TechBadgesProps) {
  const displayTechs = limit ? techs.slice(0, limit) : techs
  const hasMore = limit && techs.length > limit

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayTechs.map((tech) => (
        <Badge
          key={tech}
          variant={active === tech ? "default" : "outline"}
          className={cn(
            "rounded-full",
            onClick && "cursor-pointer hover:bg-secondary/80 transition-colors"
          )}
          onClick={() => onClick && onClick(tech)}
        >
          {tech}
        </Badge>
      ))}
      {hasMore && (
        <Badge variant="outline" className="rounded-full">
          +{techs.length - limit} more
        </Badge>
      )}
    </div>
  )
}