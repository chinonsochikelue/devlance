import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MapPin, Briefcase, DollarSign, Calendar } from "lucide-react"

interface JobCardProps {
  job: {
    _id: string
    title: string
    company: string
    location: string
    type: string
    salary?: { min: number; max: number; currency: string } // Adjusted type for salary
    createdAt: string
    applicationsCount?: number
  }
}

export default function JobCard({ job }: JobCardProps) {
  const postedDate = new Date(job.createdAt)
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true })

  return (
    <Link href={`/jobs/${job._id}`} className="block">
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
            <Badge
              variant={
                job.type === "Full-time"
                  ? "default"
                  : job.type === "Part-time"
                    ? "secondary"
                    : job.type === "Contract"
                      ? "outline"
                      : job.type === "Internship"
                        ? "destructive"
                        : "default"
              }
            >
              {job.type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{job.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>{job.type}</span>
            </div>
            {job.salary && (
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>
                  {job.salary.min} - {job.salary.max} {job.salary.currency}
                </span>
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Posted {timeAgo}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4 pb-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm font-medium">View Details</span>
            {job.applicationsCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {job.applicationsCount} application{job.applicationsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
