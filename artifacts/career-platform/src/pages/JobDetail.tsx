import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useGetJob, useRecordJobView } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Briefcase, DollarSign, Clock, CheckCircle2, 
  ExternalLink, Share2, Building, Calendar, GraduationCap 
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const params = useParams();
  // Assume slug might be just an ID, or parse it if it ends in an ID
  // For safety, let's just parse it as int. In a real app, we'd lookup by slug.
  // The API spec requires `id: number` for getJob.
  const id = parseInt(params.slug || "0", 10);
  
  const { data: job, isLoading } = useGetJob(id, {
    query: {
      enabled: !isNaN(id) && id > 0,
    }
  });

  const recordView = useRecordJobView();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (job?.id && !hasRecorded.current) {
      recordView.mutate({ id: job.id });
      hasRecorded.current = true;
    }
  }, [job?.id, recordView]);

  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Job link copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-40 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
        <p className="text-muted-foreground">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-12">
      {/* Header Header */}
      <div className="bg-background border-b pt-12 pb-8 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-muted rounded-xl border flex items-center justify-center overflow-hidden shrink-0">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="font-medium text-primary">{job.companyName}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button className="w-full md:w-auto" asChild>
                <a href={job.applyLink} target="_blank" rel="noreferrer">
                  Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Job Description</h2>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                    {job.description}
                  </div>
                </div>

                {job.selectionProcess && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Selection Process</h2>
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                      {job.selectionProcess}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Job Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Job Type</div>
                      <div className="text-sm text-muted-foreground capitalize">{job.jobType.replace('-', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Salary</div>
                      <div className="text-sm text-muted-foreground">{job.salaryDisplay || "Not specified"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Experience</div>
                      <div className="text-sm text-muted-foreground">{job.experience}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Education</div>
                      <div className="text-sm text-muted-foreground">{job.education}</div>
                    </div>
                  </div>
                  {job.deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Apply Before</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(job.deadline), "MMMM d, yyyy")}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-md border flex items-center justify-center overflow-hidden shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-lg text-muted-foreground">{job.companyName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{job.companyName}</div>
                    {job.companyWebsite && (
                      <a href={job.companyWebsite} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                        Visit website
                      </a>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/companies/${job.companyId}`}>View Company Profile</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
