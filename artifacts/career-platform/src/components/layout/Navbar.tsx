import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, LayoutGrid, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/jobs", label: "Find Jobs", icon: Search },
    { href: "/companies", label: "Companies", icon: Building },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
          <Briefcase className="h-6 w-6" />
          <span>NextStep</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                location.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 text-lg font-medium ${
                      location.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
