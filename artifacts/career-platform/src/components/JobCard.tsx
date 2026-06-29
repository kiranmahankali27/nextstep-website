import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@workspace/api-client-react";
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const isNew = new Date().getTime() - new Date(job.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="h-full hover-elevate transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/20 overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xl text-muted-foreground">
                    {job.companyName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {job.companyName}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {job.featured && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent dark:bg-amber-900/30 dark:text-amber-300">
                  Featured
                </Badge>
              )}
              {isNew && !job.featured && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent dark:bg-blue-900/30 dark:text-blue-300">
                  New
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0 text-foreground/50" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 shrink-0 text-foreground/50" />
              <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 shrink-0 text-foreground/50" />
              <span className="truncate">{job.salaryDisplay || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground/50" />
              <span className="truncate">{job.experience}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="font-normal text-xs bg-muted/50 text-muted-foreground border-border/50">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline" className="font-normal text-xs bg-muted/50 text-muted-foreground border-border/50">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-muted/20 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          {job.remote && (
            <Badge variant="secondary" className="font-normal text-xs">Remote</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
