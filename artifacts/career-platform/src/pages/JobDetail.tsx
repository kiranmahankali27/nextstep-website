import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "wouter";
import { useGetJob, useRecordJobView, getGetJobQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, 
  ExternalLink, Share2, Building, Calendar, GraduationCap, Timer
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const params = useParams();
  const id = parseInt(params.slug || "0", 10);
  
  const { data: job, isLoading } = useGetJob(id, {
    query: {
      enabled: !isNaN(id) && id > 0,
      queryKey: getGetJobQueryKey(id),
    }
  });

  const recordView = useRecordJobView();
  const hasRecorded = useRef(false);

  const [countdown, setCountdown] = useState(10);
  const [unlocked, setUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setUnlocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCountdown]);

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
                    <IndianRupee className="w-5 h-5 text-primary mt-0.5" />
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

      {/* Apply Section — inline at bottom of content, above footer */}
      <div className="container mx-auto px-4 max-w-5xl mt-8 pb-12">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-primary/5 border-b px-6 py-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              {unlocked ? "Application link is ready!" : "Preparing your application link…"}
            </span>
          </div>
          <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3 w-full">
              <p className="text-sm text-muted-foreground">
                {unlocked
                  ? "You can now proceed to the official application page."
                  : `Please read the job description above carefully. The apply link will unlock in ${countdown} second${countdown !== 1 ? "s" : ""}.`}
              </p>
              {/* Progress bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {!unlocked && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-2xl tabular-nums shadow-md select-none">
                    {countdown}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">seconds</span>
                </div>
              )}
              {unlocked ? (
                <Button size="lg" className="gap-2 animate-in fade-in zoom-in-95 duration-500 px-8" asChild>
                  <a href={job.applyLink} target="_blank" rel="noreferrer noopener">
                    Apply Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled className="gap-2 px-8 opacity-50 cursor-not-allowed">
                  Apply Now
                  <Timer className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
