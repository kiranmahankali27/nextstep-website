import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";

interface SitePage {
  id: number;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

const PAGE_LABELS: Record<string, string> = {
  about: "About Us",
  contact: "Contact Us",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
};

export default function AdminPages() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string>("about");
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/pages")
      .then(r => r.json())
      .then((data: SitePage[]) => {
        const sorted = Object.keys(PAGE_LABELS).map(slug =>
          data.find(p => p.slug === slug)
        ).filter(Boolean) as SitePage[];
        setPages(sorted);
        if (sorted.length > 0) {
          const first = sorted[0];
          setActiveSlug(first.slug);
          setForm({ title: first.title, content: first.content });
        }
      })
      .catch(() => toast({ variant: "destructive", title: "Failed to load pages" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const selectPage = (page: SitePage) => {
    setActiveSlug(page.slug);
    setForm({ title: page.title, content: page.content });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${activeSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated: SitePage = await res.json();
      setPages(prev => prev.map(p => p.slug === activeSlug ? updated : p));
      toast({ title: "Page saved!", description: `"${form.title}" updated successfully.` });
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const activePage = pages.find(p => p.slug === activeSlug);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Pages</h1>
        <p className="text-muted-foreground mt-1">Edit the static content pages shown in your footer.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Page List */}
          <div className="space-y-2">
            {pages.map(page => (
              <button
                key={page.slug}
                onClick={() => selectPage(page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  activeSlug === page.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {PAGE_LABELS[page.slug] || page.title}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{PAGE_LABELS[activeSlug] || activePage?.title}</CardTitle>
                    <CardDescription>
                      Public URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">/{activeSlug}</code>
                      {activePage && (
                        <> · Last saved: {new Date(activePage.updatedAt).toLocaleDateString("en-IN")}</>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">Public Page</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Page title shown in the header"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <p className="text-xs text-muted-foreground">Use blank lines to separate paragraphs. Content is displayed as plain text.</p>
                  <Textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write the page content here..."
                    rows={16}
                    className="font-mono text-sm resize-y"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
