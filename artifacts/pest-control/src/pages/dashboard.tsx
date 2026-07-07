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
import type { Booking, BookingStatus, ServiceItem } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import { useUserContext, isAdmin, isTechnician } from "@/lib/user-context";

// ─── Progress tracker ────────────────────────────────────────────────────────

const PROGRESS_STAGES: { key: BookingStatus | "submitted"; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "technician-assigned", label: "Assigned" },
  { key: "en-route", label: "Scheduled" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function statusToStepIndex(status: BookingStatus): number {
  if (status === "pending" || status === "confirmed") return 0;
  if (status === "technician-assigned") return 1;
  if (status === "en-route") return 2;
  if (status === "in-progress") return 3;
  if (status === "completed") return 4;
  return -1; // cancelled
}

function BookingProgressTracker({ status }: { status: BookingStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-danger font-medium">
        <span className="inline-block h-2 w-2 rounded-full bg-danger" />
        Booking Cancelled
      </div>
    );
  }

  const activeStep = statusToStepIndex(status);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {PROGRESS_STAGES.map((stage, idx) => {
          const done = idx < activeStep;
          const current = idx === activeStep;
          const isLast = idx === PROGRESS_STAGES.length - 1;
          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              {/* Step dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : current
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-muted text-text-muted/50 border border-border"
                  }`}
                >
                  {done ? (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium whitespace-nowrap ${
                    done || current ? "text-primary" : "text-text-muted/60"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCards({ bookings }: { bookings: Booking[] }) {
  const total = bookings.length;
  const pending = bookings.filter((b) => !["completed", "cancelled"].includes(b.status)).length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const lastCompleted = bookings
    .filter((b) => b.status === "completed" && b.scheduledDate)
    .sort((a, b) => new Date(b.scheduledDate!).getTime() - new Date(a.scheduledDate!).getTime())[0];

  const lastDate = lastCompleted?.scheduledDate
    ? new Date(lastCompleted.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const cards = [
    { label: "Total Bookings", value: total, icon: "📋" },
    { label: "Pending Services", value: pending, icon: "⏳" },
    { label: "Completed", value: completed, icon: "✅" },
    { label: "Last Service", value: lastDate, icon: "📅" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xl mb-1">{c.icon}</p>
          <p className="text-xl font-semibold text-primary">{c.value}</p>
          <p className="text-xs text-text-muted mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Booking card with progress tracker ──────────────────────────────────────

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
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-muted">
          <span>
            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "—"}
            {booking.timeSlot ? ` · ${booking.timeSlot}` : ""}
          </span>
          {booking.price !== undefined && <span>₹{booking.price}</span>}
        </div>
        {!["completed", "cancelled"].includes(booking.status) && (
          <BookingProgressTracker status={booking.status} />
        )}
      </div>
    </Link>
  );
}

// ─── Customer dashboard ───────────────────────────────────────────────────────

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm animate-pulse">
              <div className="h-5 w-8 rounded bg-muted mb-2" />
              <div className="h-6 w-12 rounded bg-muted mb-1" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 h-24 animate-pulse" />
        <div className="rounded-xl border border-border bg-card p-5 h-24 animate-pulse" />
      </div>
    );
  }

  if (error) return <p className="text-danger" data-testid="text-error">{error}</p>;

  const upcoming = bookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  const history = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="text-4xl mb-4">📋</div>
        <h3>No bookings yet</h3>
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
    <div>
      <SummaryCards bookings={bookings} />
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
          {upcoming.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-text-muted text-sm">No upcoming bookings.</p>
              <Link href="/quote" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Schedule a Service</Button>
              </Link>
            </div>
          )}
          {upcoming.map((b) => <BookingCard key={b._id} booking={b} />)}
        </TabsContent>
        <TabsContent value="history" className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-text-muted py-6 text-center">No past bookings yet.</p>
          )}
          {history.map((b) => <BookingCard key={b._id} booking={b} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────

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
          My Profile →
        </Link>
      </header>
      <div>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 h-24 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && <CustomerDashboard />}
      </div>
    </div>
  );
}
