import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListJobs } from "@workspace/api-client-react";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";

export default function Jobs() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    experience: searchParams.get("experience") || "",
    type: searchParams.get("type") || "",
    remote: searchParams.get("remote") === "true",
  });

  const { data, isLoading } = useListJobs(filters);

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, String(v));
    });
    setLocation(`/jobs?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Jobs</h1>
        <p className="text-muted-foreground">Find your next career opportunity.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 space-y-6 sticky top-24">
            <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Job title or skill..." 
                    className="pl-9"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange("keyword", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="City or state..." 
                    className="pl-9"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={filters.experience} onValueChange={(v) => handleFilterChange("experience", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="fresher">Fresher (0 years)</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5+ years">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="remote" 
                  checked={filters.remote}
                  onCheckedChange={(c) => handleFilterChange("remote", c as boolean)}
                />
                <Label htmlFor="remote" className="font-normal cursor-pointer">
                  Remote jobs only
                </Label>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFilters({ keyword: "", location: "", category: "", experience: "", type: "", remote: false });
                setLocation("/jobs");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Job List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.jobs.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 border border-dashed rounded-xl">
              <h3 className="text-xl font-medium text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters to find more opportunities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{data?.total || 0}</span> jobs
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
