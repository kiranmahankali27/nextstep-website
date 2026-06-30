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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0b2a]/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
          <Briefcase className="h-6 w-6 text-indigo-400" />
          <span>NextStep</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.startsWith(item.href)
                  ? "text-indigo-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/25">
            <Link href="/jobs">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0d0b2a] border-white/10">
              <div className="flex flex-col gap-6 mt-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
                  <Briefcase className="h-6 w-6 text-indigo-400" />
                  <span>NextStep</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 text-lg font-medium ${
                      location.startsWith(item.href) ? "text-indigo-400" : "text-white/60"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-2 bg-indigo-600 hover:bg-indigo-500" onClick={() => setIsOpen(false)}>
                  <Link href="/jobs">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
