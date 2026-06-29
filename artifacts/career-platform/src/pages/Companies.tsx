import { useListCompanies } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Globe, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Companies() {
  const { data: companies, isLoading } = useListCompanies({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Featured Companies</h1>
        <p className="text-xl text-muted-foreground">
          Discover great places to work. Explore companies hiring fresh talent right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Skeleton className="w-20 h-20 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))
        ) : (
          companies?.map((company) => (
            <Card key={company.id} className="hover-elevate transition-all border-border/50 hover:border-primary/30">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-20 h-20 bg-muted rounded-xl border flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{company.name}</h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-4">
                    {company.industry && <span>{company.industry}</span>}
                    {company.location && (
                      <span className="flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> {company.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto flex flex-col gap-3">
                  <div className="text-center text-sm font-medium bg-primary/5 text-primary py-2 rounded-md">
                    {company.jobCount} open jobs
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/jobs?company=${company.id}`}>View Jobs</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
