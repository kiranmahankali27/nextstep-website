import { useState, useRef } from "react";
import { useListCompanies, useDeleteCompany, useCreateCompany } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MoreHorizontal, Edit, Trash, Building, Upload, Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const INDUSTRIES = [
  "Information Technology", "Finance & Banking", "Healthcare", "Education",
  "E-Commerce", "Manufacturing", "Media & Entertainment", "Consulting",
  "Telecommunications", "Government / PSU", "Logistics", "Retail", "Other"
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface CompanyForm {
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  logo: string;
  featured: boolean;
}

const emptyForm: CompanyForm = {
  name: "", website: "", industry: "", size: "", location: "",
  description: "", logo: "", featured: false,
};

export default function AdminCompanies() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoLoading, setLogoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useListCompanies({ limit: 50 });
  const deleteMutation = useDeleteCompany();
  const createMutation = useCreateCompany();
  const { toast } = useToast();

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Logo must be under 2MB." });
      return;
    }
    setLogoLoading(true);
    try {
      const base64 = await fileToBase64(file);
      setLogoPreview(base64);
      setForm(f => ({ ...f, logo: base64 }));
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not process the image." });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Validation error", description: "Company name is required." });
      return;
    }
    const payload: Record<string, unknown> = { name: form.name.trim(), featured: form.featured };
    if (form.website) payload.website = form.website;
    if (form.industry) payload.industry = form.industry;
    if (form.size) payload.size = form.size;
    if (form.location) payload.location = form.location;
    if (form.description) payload.description = form.description;
    if (form.logo) payload.logo = form.logo;

    createMutation.mutate(
      { data: payload as Parameters<typeof createMutation.mutate>[0]["data"] },
      {
        onSuccess: () => {
          toast({ title: "Company added", description: `"${form.name}" has been created.` });
          setOpen(false);
          setForm(emptyForm);
          setLogoPreview("");
          refetch();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create company. Please try again." });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this company? All associated jobs will also be deleted.")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Company deleted", description: "The company has been successfully deleted." });
          refetch();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete the company. Please try again." });
        }
      }
    );
  };

  const filteredCompanies = data?.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Companies</h1>
          <p className="text-muted-foreground mt-1">View, add, and edit company profiles.</p>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setLogoPreview(""); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted cursor-pointer hover:border-primary transition-colors shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground text-center">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or SVG. Max 2MB.</p>
                    {logoPreview && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => { setLogoPreview(""); setForm(f => ({ ...f, logo: "" })); }}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Company Name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="e.g. Tata Consultancy Services" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={form.size} onValueChange={v => setForm(f => ({ ...f, size: v }))}>
                    <SelectTrigger><SelectValue placeholder="Employees" /></SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Mumbai, Maharashtra" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://company.com" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description of the company..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Featured Company</p>
                  <p className="text-xs text-muted-foreground">Show on the homepage featured section</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Company
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Active Jobs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCompanies && filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded border overflow-hidden flex items-center justify-center bg-muted shrink-0">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {company.name}
                              {company.featured && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">Featured</Badge>
                              )}
                            </div>
                            {company.website && (
                              <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary hover:underline block truncate max-w-[200px]">
                                {company.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{company.industry || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{company.location || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {company.jobCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDelete(company.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
