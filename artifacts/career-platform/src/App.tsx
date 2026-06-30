import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/context/AdminContext";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Import pages (we will create these next)
import Home from "@/pages/Home";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Companies from "@/pages/Companies";
import Categories from "@/pages/Categories";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminJobs from "@/pages/AdminJobs";
import AdminJobForm from "@/pages/AdminJobForm";
import AdminCompanies from "@/pages/AdminCompanies";
import AdminCategories from "@/pages/AdminCategories";
import AdminPages from "@/pages/AdminPages";
import StaticPage from "@/pages/StaticPage";
import { useAdmin } from "@/context/AdminContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLogin />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedAdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/jobs">
        <ProtectedAdminRoute component={AdminJobs} />
      </Route>
      <Route path="/admin/jobs/new">
        <ProtectedAdminRoute component={AdminJobForm} />
      </Route>
      <Route path="/admin/jobs/:id/edit">
        <ProtectedAdminRoute component={AdminJobForm} />
      </Route>
      <Route path="/admin/companies">
        <ProtectedAdminRoute component={AdminCompanies} />
      </Route>
      <Route path="/admin/categories">
        <ProtectedAdminRoute component={AdminCategories} />
      </Route>
      <Route path="/admin/pages">
        <ProtectedAdminRoute component={AdminPages} />
      </Route>

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
      <Route path="/jobs">
        <PublicLayout>
          <Jobs />
        </PublicLayout>
      </Route>
      <Route path="/jobs/:slug">
        <PublicLayout>
          <JobDetail />
        </PublicLayout>
      </Route>
      <Route path="/companies">
        <PublicLayout>
          <Companies />
        </PublicLayout>
      </Route>
      <Route path="/categories">
        <PublicLayout>
          <Categories />
        </PublicLayout>
      </Route>

      {/* Static CMS Pages */}
      <Route path="/about">
        <PublicLayout><StaticPage /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><StaticPage /></PublicLayout>
      </Route>
      <Route path="/privacy-policy">
        <PublicLayout><StaticPage /></PublicLayout>
      </Route>
      <Route path="/terms-of-service">
        <PublicLayout><StaticPage /></PublicLayout>
      </Route>

      <Route>
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AdminProvider>
            <Router />
          </AdminProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
