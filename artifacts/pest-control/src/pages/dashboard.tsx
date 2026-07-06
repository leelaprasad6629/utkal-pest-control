/**
 * Dashboard — role-aware entry point.
 *
 * After the UserContext loads the authenticated user from /api/me (which syncs
 * the Clerk publicMetadata role to the DB), we redirect to the correct
 * sub-dashboard so each role always lands on the right page.
 *
 *   admin / manager → /dashboard/admin
 *   technician      → /dashboard/technician
 *   customer        → inline customer dashboard
 */

import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import type { Booking, ServiceItem } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import { useUserContext, isAdmin, isTechnician } from "@/lib/user-context";

function BookingCard({ booking }: { booking: Booking }) {
  const service = typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;
  return (
    <Link href={`/bookings/${booking._id}`} data-testid={`card-booking-${booking._id}`}>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">{service?.name ?? "Service"}</p>
            <p className="text-xs text-text-muted mt-0.5">{booking.bookingNumber}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-muted">
          <span>
            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "—"}
            {booking.timeSlot ? ` · ${booking.timeSlot}` : ""}
          </span>
          {booking.price !== undefined && <span>₹{booking.price}</span>}
          <span className="capitalize">Payment: {booking.paymentStatus}</span>
        </div>
      </div>
    </Link>
  );
}

function CustomerDashboard() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<Booking[]>("/bookings", { token });
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-text-muted">Loading your bookings...</p>;
  if (error) return <p className="text-danger" data-testid="text-error">{error}</p>;

  const upcoming = bookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  const history = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <h3>My Bookings</h3>
        <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
          Your bookings and their status will appear here once you request a quote.
        </p>
        <div className="mt-6">
          <Link href="/quote">
            <Button data-testid="button-dashboard-get-quote">Get a Quote</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="upcoming">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History ({history.length})</TabsTrigger>
        </TabsList>
        <Link href="/quote">
          <Button size="sm" data-testid="button-new-booking">New Booking</Button>
        </Link>
      </div>
      <TabsContent value="upcoming" className="space-y-3">
        {upcoming.length === 0 && <p className="text-sm text-text-muted py-6 text-center">No upcoming bookings.</p>}
        {upcoming.map((b) => (
          <BookingCard key={b._id} booking={b} />
        ))}
      </TabsContent>
      <TabsContent value="history" className="space-y-3">
        {history.length === 0 && <p className="text-sm text-text-muted py-6 text-center">No past bookings yet.</p>}
        {history.map((b) => (
          <BookingCard key={b._id} booking={b} />
        ))}
      </TabsContent>
    </Tabs>
  );
}

export default function Dashboard() {
  const { user, loading } = useUserContext();

  // Redirect to role-specific dashboard pages — this keeps admin and technician
  // UIs at stable, bookmarkable URLs with proper route-level protection.
  if (!loading && isAdmin(user)) return <Redirect to="/dashboard/admin" />;
  if (!loading && isTechnician(user)) return <Redirect to="/dashboard/technician" />;

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-primary">My Dashboard</h1>
          {!loading && user && (
            <p className="text-sm text-text-muted mt-0.5">Welcome back, {user.name}</p>
          )}
        </div>
        <Link href="/profile" className="text-sm text-primary hover:underline" data-testid="link-profile">
          My Profile
        </Link>
      </header>
      <div>
        {loading && <p className="text-text-muted">Loading...</p>}
        {!loading && <CustomerDashboard />}
      </div>
    </div>
  );
}
