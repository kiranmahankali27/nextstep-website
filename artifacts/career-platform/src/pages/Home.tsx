import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Briefcase, TrendingUp, Building, Code, Users } from "lucide-react";
import { useGetPlatformStats, useListFeaturedJobs, useListTrendingJobs, useListLatestJobs, useSubscribeNewsletter } from "@workspace/api-client-react";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const { toast } = useToast();

  const { data: stats } = useGetPlatformStats();
  const { data: featuredJobs, isLoading: isLoadingFeatured } = useListFeaturedJobs({ limit: 3 });
  const { data: trendingJobs, isLoading: isLoadingTrending } = useListTrendingJobs({ limit: 4 });
  const { data: latestJobs, isLoading: isLoadingLatest } = useListLatestJobs({ limit: 6 });
  
  const subscribeMutation = useSubscribeNewsletter();
  const [email, setEmail] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.append("keyword", searchKeyword);
    if (searchLocation) params.append("location", searchLocation);
    setLocation(`/jobs?${params.toString()}`);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast({
            title: "Subscribed successfully!",
            description: "You will receive the latest job updates in your inbox.",
          });
          setEmail("");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Subscription failed",
            description: "Please try again later.",
          });
        }
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 mx-auto bg-primary/10 text-primary hover:bg-primary/20 border-transparent">
                The #1 Career Platform for Students
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
                Find your first <span className="text-primary">dream job</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Connect with forward-thinking companies looking for fresh talent. 
                Explore thousands of entry-level roles, internships, and graduate programs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-2 shadow-xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center relative px-2">
                    <Search className="w-5 h-5 text-muted-foreground absolute left-4" />
                    <Input 
                      placeholder="Job title, keywords, or company" 
                      className="pl-10 border-0 shadow-none focus-visible:ring-0 text-base"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                  <div className="hidden md:block w-px h-10 bg-border my-auto"></div>
                  <div className="flex-1 flex items-center relative px-2 border-t md:border-t-0 md:mt-0 mt-2 pt-2 md:pt-0">
                    <MapPin className="w-5 h-5 text-muted-foreground absolute left-4" />
                    <Input 
                      placeholder="City, state, or 'remote'" 
                      className="pl-10 border-0 shadow-none focus-visible:ring-0 text-base"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 text-base">
                    Search Jobs
                  </Button>
                </form>
              </Card>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium mr-2">Popular:</span>
                {['Software Engineer', 'Data Analyst', 'Marketing Intern', 'Remote', 'Walk-in'].map(term => (
                  <Button 
                    key={term} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 text-xs bg-background/50 border-border/50 hover:border-primary/50"
                    onClick={() => {
                      setSearchKeyword(term);
                      setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 0);
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="px-4">
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.totalJobs ? new Intl.NumberFormat().format(stats.totalJobs) : "..."}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Live Jobs</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.totalCompanies ? new Intl.NumberFormat().format(stats.totalCompanies) : "..."}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Companies</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.activeJobs ? new Intl.NumberFormat().format(stats.activeJobs) : "..."}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">New This Week</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold text-foreground mb-1">24h</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16 md:py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Opportunities</h2>
              <p className="text-muted-foreground">Freshly posted roles perfect for your next step.</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/jobs">View All Jobs &rarr;</a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingLatest ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-[280px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex gap-4 mb-6">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-auto">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              latestJobs?.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Software Engineering", icon: Code, count: "1.2k+" },
              { name: "Data & Analytics", icon: TrendingUp, count: "800+" },
              { name: "Design & UX", icon: Briefcase, count: "450+" },
              { name: "Marketing", icon: Users, count: "600+" },
              { name: "Sales", icon: TrendingUp, count: "500+" },
              { name: "Finance", icon: Briefcase, count: "350+" },
              { name: "HR & Recruiting", icon: Users, count: "200+" },
              { name: "Operations", icon: Building, count: "300+" },
            ].map((category) => (
              <a 
                key={category.name} 
                href={`/jobs?category=${category.name}`}
                className="group flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:shadow-md transition-all text-center"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} jobs</p>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="ghost" asChild>
              <a href="/categories">View All Categories &rarr;</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Career Tips */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">Career Resources</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">Expert advice to help you land your dream job and build a successful career.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Resume Writing Guide", desc: "How to craft a resume that beats ATS and impresses recruiters." },
              { title: "Interview Prep", desc: "Top 50 common interview questions and how to answer them." },
              { title: "Salary Negotiation", desc: "Strategies for freshers to negotiate their first salary." },
              { title: "Coding Practice", desc: "Master algorithms and data structures for technical rounds." },
              { title: "Aptitude Tests", desc: "Prepare for quantitative, logical and verbal reasoning tests." },
              { title: "Government Jobs Guide", desc: "Everything you need to know about preparing for public sector exams." }
            ].map((tip, i) => (
              <Card key={i} className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl text-white">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-foreground/80">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-muted/30 rounded-3xl p-8 md:p-12 border border-border/50">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Never miss an opportunity</h2>
            <p className="text-muted-foreground mb-8">Subscribe to our newsletter and get the latest jobs and career tips delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12 flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="h-12 px-8" disabled={subscribeMutation.isPending}>
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
