import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Briefcase, TrendingUp, Building, Code, Users,
  Zap, Shield, Globe, Star, ArrowRight, BookOpen, Cpu, BarChart3,
  Palette, Megaphone, HeartPulse, Landmark, ShoppingBag
} from "lucide-react";
import { useGetPlatformStats, useListLatestJobs, useSubscribeNewsletter } from "@workspace/api-client-react";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { name: "Software Engineering", icon: Code, gradient: "from-violet-500 to-indigo-600", bg: "bg-violet-50", text: "text-violet-700" },
  { name: "Data & Analytics", icon: BarChart3, gradient: "from-blue-500 to-cyan-600", bg: "bg-blue-50", text: "text-blue-700" },
  { name: "Design & UX", icon: Palette, gradient: "from-pink-500 to-rose-600", bg: "bg-pink-50", text: "text-pink-700" },
  { name: "Marketing", icon: Megaphone, gradient: "from-orange-500 to-amber-600", bg: "bg-orange-50", text: "text-orange-700" },
  { name: "Finance & Banking", icon: Landmark, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  { name: "Healthcare", icon: HeartPulse, gradient: "from-red-500 to-pink-600", bg: "bg-red-50", text: "text-red-700" },
  { name: "Sales", icon: TrendingUp, gradient: "from-yellow-500 to-orange-600", bg: "bg-yellow-50", text: "text-yellow-700" },
  { name: "E-Commerce", icon: ShoppingBag, gradient: "from-purple-500 to-violet-600", bg: "bg-purple-50", text: "text-purple-700" },
];

const CAREER_TIPS = [
  { title: "Resume Writing Guide", desc: "Craft a resume that beats ATS and impresses recruiters on the very first scan.", icon: BookOpen, color: "text-violet-400" },
  { title: "Interview Prep", desc: "Top 50 common questions with smart, memorable answers tailored for freshers.", icon: Users, color: "text-cyan-400" },
  { title: "Salary Negotiation", desc: "Strategies for freshers to confidently negotiate their first salary package.", icon: TrendingUp, color: "text-emerald-400" },
  { title: "Coding Practice", desc: "Master algorithms and data structures to ace every technical interview round.", icon: Cpu, color: "text-pink-400" },
  { title: "Aptitude Tests", desc: "Crack quantitative, logical and verbal reasoning tests at India's top companies.", icon: Zap, color: "text-amber-400" },
  { title: "Government Jobs Guide", desc: "Everything about UPSC, SSC, Banking exams and public sector recruitment.", icon: Landmark, color: "text-blue-400" },
];

const WHY_US = [
  { icon: Zap, title: "Instant Notifications", desc: "Get alerted the moment a matching job is posted — never miss an opportunity.", color: "bg-amber-100 text-amber-600" },
  { icon: Shield, title: "Verified Listings", desc: "Every job is reviewed and verified. No scams, no fake postings, ever.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Globe, title: "Pan-India Reach", desc: "Jobs from startups to PSUs across every city and state in India.", color: "bg-blue-100 text-blue-600" },
  { icon: Star, title: "Fresher-First", desc: "Designed exclusively for students and fresh graduates — zero experience required.", color: "bg-violet-100 text-violet-600" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const { data: stats } = useGetPlatformStats();
  const { data: latestJobs, isLoading: isLoadingLatest } = useListLatestJobs({ limit: 6 });
  const subscribeMutation = useSubscribeNewsletter();

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
          toast({ title: "Subscribed!", description: "You'll receive the latest job alerts in your inbox." });
          setEmail("");
        },
        onError: () => toast({ variant: "destructive", title: "Failed", description: "Please try again later." }),
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0d0b2a] pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Badge className="mb-6 mx-auto bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30">
                🚀 India's #1 Career Platform for Freshers
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Find your first{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  dream job
                </span>
              </h1>
              <p className="text-xl text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed">
                Connect with top companies hiring freshers, interns, and graduates.
                Thousands of verified jobs — updated daily.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center relative px-2">
                    <Search className="w-5 h-5 text-white/40 absolute left-4" />
                    <Input
                      placeholder="Job title, keyword, or company"
                      className="pl-10 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent text-white placeholder:text-white/40"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                  <div className="hidden md:block w-px h-10 bg-white/20 my-auto" />
                  <div className="flex-1 flex items-center relative px-2 border-t border-white/10 md:border-t-0">
                    <MapPin className="w-5 h-5 text-white/40 absolute left-4" />
                    <Input
                      placeholder="City, state, or 'remote'"
                      className="pl-10 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent text-white placeholder:text-white/40"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40">
                    Search Jobs
                  </Button>
                </form>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-white/40 mr-1">Popular:</span>
                {["Software Engineer", "Data Analyst", "Marketing Intern", "Remote", "Walk-in"].map(term => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    className="rounded-full h-7 text-xs bg-white/5 border-white/15 text-white/70 hover:bg-white/15 hover:text-white"
                    onClick={() => { setSearchKeyword(term); setLocation(`/jobs?keyword=${encodeURIComponent(term)}`); }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-b border-white/10 bg-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10 text-center">
            {[
              { value: stats?.totalJobs ?? "...", label: "Live Jobs", color: "text-indigo-400" },
              { value: stats?.totalCompanies ?? "...", label: "Companies", color: "text-violet-400" },
              { value: stats?.activeJobs ?? "...", label: "New This Week", color: "text-pink-400" },
              { value: "24h", label: "Avg. Response", color: "text-emerald-400" },
            ].map((s, i) => (
              <div key={i} className="px-4 py-2">
                <div className={`text-3xl font-extrabold mb-1 ${s.color}`}>
                  {typeof s.value === "number" ? new Intl.NumberFormat().format(s.value) : s.value}
                </div>
                <div className="text-xs text-white/40 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore by Category ── */}
      <section className="py-16 md:py-24 bg-[#0d0b2a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Browse by Role</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white">Explore by Category</h2>
            <p className="text-white/50 max-w-xl mx-auto">Pick your field and discover hundreds of opportunities waiting for you.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:bg-white/10 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1 leading-tight">{cat.name}</h3>
                <p className="text-xs text-white/40 flex items-center justify-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Browse Jobs
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" asChild className="rounded-full px-8 border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
              <Link href="/categories">View All Categories →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Latest Jobs ── */}
      <section className="py-16 md:py-24 bg-[#100e2e]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <Badge className="mb-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Fresh Opportunities</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Latest Job Listings</h2>
              <p className="text-white/50 mt-1">Verified jobs posted in the last 24 hours.</p>
            </div>
            <Button variant="outline" className="rounded-full shrink-0 border-white/20 text-white/70 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/jobs">View All Jobs →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoadingLatest
              ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-[280px]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex gap-4 mb-6"><Skeleton className="w-12 h-12 rounded-lg" /><div className="space-y-2 flex-1"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>
                    <div className="grid grid-cols-2 gap-4 mb-auto"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                  </CardContent>
                </Card>
              ))
              : latestJobs?.map((job) => <JobCard key={job.id} job={job} />)
            }
          </div>
        </div>
      </section>

      {/* ── Why NextStep ── */}
      <section className="py-16 md:py-20 bg-[#0d0b2a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Built for freshers, by freshers</h2>
            <p className="text-white/50 mt-2 max-w-xl mx-auto">Everything you need to land your first job — all in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div key={item.title} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/8 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Career Resources ── */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#0d0b2a]">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-white/10 text-white/80 border-white/20">Free Resources</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Career Resources</h2>
            <p className="text-white/50 max-w-xl mx-auto">Expert guides to help you land your dream job and build a thriving career.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAREER_TIPS.map((tip, i) => (
              <Card key={i} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <tip.icon className={`w-6 h-6 ${tip.color}`} />
                    <CardTitle className="text-base text-white">{tip.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/55 leading-relaxed">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Stay Ahead</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Never miss an opportunity</h2>
            <p className="text-white/70 mb-8 text-lg">Get the latest job alerts and career tips straight to your inbox every day.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="h-12 flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus-visible:ring-white/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="h-12 px-8 bg-white text-indigo-700 hover:bg-white/90 font-semibold" disabled={subscribeMutation.isPending}>
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-white/40 text-xs mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
