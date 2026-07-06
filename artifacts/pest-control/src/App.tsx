import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import Quote from "@/pages/quote";
import Dashboard from "@/pages/dashboard";
import DashboardAdmin from "@/pages/dashboard-admin";
import DashboardTechnician from "@/pages/dashboard-technician";
import BookingDetail from "@/pages/booking-detail";
import Profile from "@/pages/profile";
import InvoiceDetail from "@/pages/invoice-detail";
import { UserProvider, useUserContext, isAdmin, isTechnician } from "@/lib/user-context";

const queryClient = new QueryClient();

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

/** Wrap a route so only signed-in users can access it. */
function AuthRequired({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

/** Redirect non-admins away from admin routes. */
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useUserContext();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>;
  if (!isAdmin(user)) return <Redirect to="/dashboard" />;
  return <Component />;
}

/** Redirect non-technicians away from technician routes. */
function TechnicianRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useUserContext();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>;
  if (!isTechnician(user)) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <>
      <SiteHeader />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/services" component={Services} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/quote" component={Quote} />

        {/* Authenticated routes */}
        <Route path="/dashboard">
          <AuthRequired>
            <Dashboard />
          </AuthRequired>
        </Route>
        <Route path="/dashboard/admin">
          <AuthRequired>
            <AdminRoute component={DashboardAdmin} />
          </AuthRequired>
        </Route>
        <Route path="/dashboard/technician">
          <AuthRequired>
            <TechnicianRoute component={DashboardTechnician} />
          </AuthRequired>
        </Route>
        <Route path="/bookings/:id">
          <AuthRequired>
            <BookingDetail />
          </AuthRequired>
        </Route>
        <Route path="/profile">
          <AuthRequired>
            <Profile />
          </AuthRequired>
        </Route>
        <Route path="/invoices/:id">
          <AuthRequired>
            <InvoiceDetail />
          </AuthRequired>
        </Route>

        <Route component={NotFound} />
      </Switch>
      <SiteFooter />
    </>
  );
}

function App() {
  if (!clerkPublishableKey) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900">Missing Clerk configuration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set the VITE_CLERK_PUBLISHABLE_KEY environment variable to enable authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <UserProvider>
              <Router />
            </UserProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
