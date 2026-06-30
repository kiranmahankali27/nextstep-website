import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SitePage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function StaticPage() {
  const [location] = useLocation();
  const slug = location.replace(/^\//, "").split("?")[0];

  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    fetch(`/api/pages/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">This page doesn't exist or hasn't been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-extrabold text-white">{page.title}</h1>
          <p className="text-white/60 text-sm mt-2">
            Last updated: {new Date(page.updatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          {page.content ? (
            <div className="prose prose-gray max-w-none">
              {page.content.split("\n\n").map((para, i) => (
                para.trim() ? <p key={i} className="mb-4 text-foreground/80 leading-relaxed">{para.trim()}</p> : null
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-2">Content coming soon</p>
              <p className="text-sm">The admin is working on this page. Check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
