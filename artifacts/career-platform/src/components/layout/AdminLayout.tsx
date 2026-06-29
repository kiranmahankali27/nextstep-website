import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { 
  Briefcase, 
  Building, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  Tags
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, username } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/companies", label: "Companies", icon: Building },
    { href: "/admin/categories", label: "Categories", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight px-2">
                      <Briefcase className="h-6 w-6" />
                      <span>Admin Portal</span>
                    </div>
                    <nav className="flex flex-col gap-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                            location === item.href || location.startsWith(`${item.href}/`)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <Briefcase className="h-6 w-6" />
              <span>Admin Portal</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              {username ? `Hello, ${username}` : "Admin"}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 flex items-start gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-2 sticky top-24">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                location === item.href || location.startsWith(`${item.href}/`)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          
          <div className="mt-8 px-4 py-3">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
              <Link href="/">
                <span className="mr-2">&larr;</span> Back to Site
              </Link>
            </Button>
          </div>
        </aside>

        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
