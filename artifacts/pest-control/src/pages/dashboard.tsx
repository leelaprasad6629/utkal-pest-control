import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { LocalUser } from "@/lib/types";
import DashboardAdmin from "./dashboard-admin";
import DashboardTechnician from "./dashboard-technician";

export default function Dashboard() {
  const { getToken } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<LocalUser>("/me", { token });
        setUser(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-primary">Dashboard</h1>
      </header>
      <div>
        {loading && <p className="text-text-muted">Loading...</p>}
        {!loading && user?.role === "admin" && <DashboardAdmin />}
        {!loading && user?.role === "technician" && <DashboardTechnician />}
        {!loading && (!user || user.role === "customer") && (
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <svg
              className="mx-auto h-14 w-14 text-primary/40"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8 20h32" stroke="currentColor" strokeWidth="2" />
              <path d="M16 8v8M32 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 28l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-4">My Bookings</h3>
            <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
              Your bookings and their status will appear here once you request a quote.
            </p>
            <div className="mt-6">
              <Link href="/quote">
                <Button data-testid="button-dashboard-get-quote">Get a Quote</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
