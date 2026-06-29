import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetJob, useCreateJob, useUpdateJob, useListCompanies, useListCategories, useCreateCompany,
  getGetJobQueryKey, JobInput 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Plus, X, Building2, ChevronDown, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListCompaniesQueryKey } from "@workspace/api-client-react";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyId: z.coerce.number().min(1, "Company is required"),
  location: z.string().min(2, "Location is required"),
  remote: z.boolean().default(false),
  jobType: z.string().min(1, "Job type is required"),
  category: z.string().min(1, "Category is required"),
  salaryDisplay: z.string().optional(),
  experience: z.string().min(1, "Experience is required"),
  education: z.string().min(1, "Education is required"),
  description: z.string().min(10, "Description is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  selectionProcess: z.string().optional(),
  applyLink: z.string().url("Must be a valid URL"),
  deadline: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["published", "draft"]).default("published"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

function CompanyCombobox({
  value,
  onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCompanyMutation = useCreateCompany();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: companies, refetch } = useListCompanies({ limit: 200 });

  const selectedCompany = companies?.find((c) => c.id === value);

  const filtered = (companies ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNewForm(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateCompany = () => {
    if (!newName.trim()) return;
    createCompanyMutation.mutate(
      { data: { name: newName.trim(), website: newWebsite.trim() || null, industry: newIndustry.trim() || null } },
      {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey({ limit: 200 }) });
          refetch();
          onChange(created.id);
          setOpen(false);
          setShowNewForm(false);
          setSearch("");
          setNewName("");
          setNewWebsite("");
          setNewIndustry("");
          toast({ title: "Company created", description: `"${created.name}" added and selected.` });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create company." });
        },
      }
    );
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); setShowNewForm(false); }}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={selectedCompany ? "text-foreground" : "text-muted-foreground"}>
          {selectedCompany ? (
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              {selectedCompany.name}
            </span>
          ) : (
            "Search or add company..."
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowNewForm(false); }}
            />
          </div>

          {/* Company list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !showNewForm && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No companies found.</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left"
              >
                <Check className={`w-4 h-4 shrink-0 ${c.id === value ? "opacity-100 text-primary" : "opacity-0"}`} />
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                {c.name}
                {c.industry && <span className="ml-auto text-xs text-muted-foreground">{c.industry}</span>}
              </button>
            ))}
          </div>

          {/* Add new company button / mini-form */}
          <div className="border-t">
            {!showNewForm ? (
              <button
                type="button"
                onClick={() => { setShowNewForm(true); setNewName(search); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent font-medium"
              >
                <Plus className="w-4 h-4" />
                Add "{search || "new company"}"
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Company</p>
                <Input
                  autoFocus
                  placeholder="Company name *"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCompany(); } }}
                />
                <Input
                  placeholder="Website (optional)"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                />
                <Input
                  placeholder="Industry (optional)"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCompany}
                    disabled={!newName.trim() || createCompanyMutation.isPending}
                    className="flex-1"
                  >
                    {createCompanyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    Create & Select
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowNewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminJobForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState("");
  
  const isEditing = params.id !== undefined && params.id !== "new";
  const jobId = isEditing ? parseInt(params.id as string, 10) : 0;

  const { data: categories } = useListCategories();
  
  const { data: job, isLoading: isJobLoading } = useGetJob(jobId, {
    query: {
      enabled: isEditing && !isNaN(jobId) && jobId > 0,
      queryKey: getGetJobQueryKey(jobId),
    }
  });

  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      companyId: 0,
      location: "",
      remote: false,
      jobType: "full-time",
      category: "",
      salaryDisplay: "",
      experience: "Fresher",
      education: "Bachelor's Degree",
      description: "",
      skills: [],
      selectionProcess: "",
      applyLink: "",
      deadline: "",
      featured: false,
      status: "published",
    },
  });

  useEffect(() => {
    if (job && isEditing) {
      form.reset({
        title: job.title,
        companyId: job.companyId,
        location: job.location,
        remote: job.remote,
        jobType: job.jobType,
        category: job.category,
        salaryDisplay: job.salaryDisplay || "",
        experience: job.experience,
        education: job.education,
        description: job.description,
        skills: job.skills,
        selectionProcess: job.selectionProcess || "",
        applyLink: job.applyLink,
        deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : "",
        featured: job.featured,
        status: job.status as "published" | "draft",
      });
    }
  }, [job, isEditing, form]);

  const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    if (skillInput.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("skills", [...currentSkills, skillInput.trim()], { shouldValidate: true });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove), { shouldValidate: true });
  };

  const onSubmit = (data: JobFormValues) => {
    const apiData: JobInput = {
      ...data,
      salaryDisplay: data.salaryDisplay || null,
      selectionProcess: data.selectionProcess || null,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: jobId, data: apiData },
        {
          onSuccess: () => {
            toast({
              title: "Job updated",
              description: "The job has been successfully updated.",
            });
            setLocation("/admin/jobs");
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to update the job. Please try again.",
            });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: apiData },
        {
          onSuccess: () => {
            toast({
              title: "Job created",
              description: "The job has been successfully created.",
            });
            setLocation("/admin/jobs");
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to create the job. Please try again.",
            });
          }
        }
      );
    }
  };

  if (isEditing && isJobLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/admin/jobs")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Job" : "Post New Job"}</h1>
          <p className="text-muted-foreground mt-1">Fill out the details below to {isEditing ? "update the" : "create a"} job posting.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <CompanyCombobox value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>Search existing companies or type a name to add a new one.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="walkin">Walk-in</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryDisplay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ₹8 LPA - ₹12 LPA / year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-8 pt-4">
                <FormField
                  control={form.control}
                  name="remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm w-full md:w-auto md:min-w-[200px]">
                      <div className="space-y-0.5 mr-4">
                        <FormLabel className="text-base cursor-pointer">Remote Job</FormLabel>
                        <FormDescription>Can be done from anywhere</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm w-full md:w-auto md:min-w-[200px]">
                      <div className="space-y-0.5 mr-4">
                        <FormLabel className="text-base cursor-pointer">Featured</FormLabel>
                        <FormDescription>Highlight on homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Required</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fresher, 1-3 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Required</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bachelor's Degree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Skills Required</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input 
                        placeholder="Type a skill and press Enter" 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(e);
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("skills").map((skill, index) => (
                        <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => removeSkill(skill)}
                            className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed job description..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectionProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selection Process (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the interview rounds..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applyLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://careers.company.com/apply" type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Save as Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => setLocation("/admin/jobs")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
