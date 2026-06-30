import { Link } from "wouter";
import { Briefcase, Github, Linkedin, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0d0b2a] text-white">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
              <Briefcase className="h-6 w-6 text-indigo-400" />
              <span>NextStep</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              India's modern career platform connecting ambitious students and fresh graduates with top companies.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-white/40 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-white/40 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">For Candidates</h3>
            <ul className="space-y-3">
              <li><Link href="/jobs" className="text-sm text-white/50 hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/companies" className="text-sm text-white/50 hover:text-white transition-colors">Browse Companies</Link></li>
              <li><Link href="/categories" className="text-sm text-white/50 hover:text-white transition-colors">Job Categories</Link></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Career Advice</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">For Employers</h3>
            <ul className="space-y-3">
              <li><Link href="/admin" className="text-sm text-white/50 hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link href="/admin" className="text-sm text-white/50 hover:text-white transition-colors">Employer Login</Link></li>
              <li><Link href="/companies" className="text-sm text-white/50 hover:text-white transition-colors">Company Profiles</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} NextStep Career Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/35">
            <span>Built with ❤️ on</span>
            <span className="text-indigo-400 font-medium">Replit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
