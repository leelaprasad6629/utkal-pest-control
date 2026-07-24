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
      <div className="flex items-center gap-2 text-sm text-danger font-medium mt-3">
        <span className="inline-block h-2 w-2 rounded-full bg-danger" />
        Booking Cancelled
      </div>
    );
  }

  const activeStep = statusToStepIndex(status);

  return (
    <div className="mt-4 w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex items-center min-w-[440px] px-1">
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
                    done || current ? "text-primary font-semibold" : "text-text-muted/60"
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

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ booking }: { booking: Booking }) {
  const service = typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-3"
      data-testid={`booking-card-${booking._id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-semibold text-primary">{booking.bookingNumber}</span>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 font-semibold text-foreground text-base sm:text-lg">{service?.name ?? "Pest Control Service"}</p>
        </div>
        <Link href={`/bookings/${booking._id}`}>
          <Button size="sm" variant="outline" className="w-full sm:w-auto font-medium" data-testid={`button-view-${booking._id}`}>
            View Details →
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-text-muted">
        <div>
          <span className="font-medium text-foreground">Scheduled Date:</span>{" "}
          {new Date(booking.scheduledDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          ({booking.timeSlot})
        </div>
        <div className="truncate">
          <span className="font-medium text-foreground">Address:</span> {booking.address.line1}, {booking.address.city}
        </div>
      </div>

      <BookingProgressTracker status={booking.status} />
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ bookings }: { bookings: Booking[] }) {
  const active = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Total Bookings</p>
        <p className="mt-1 text-2xl font-bold text-primary">{bookings.length}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Active Services</p>
        <p className="mt-1 text-2xl font-bold text-primary">{active}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Completed Services</p>
        <p className="mt-1 text-2xl font-bold text-primary">{completed}</p>
      </div>
    </div>
  );
}

// ─── Customer view ───────────────────────────────────────────────────────────

function CustomerDashboard() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        const data = await apiFetch<Booking[]>("/bookings", { token });
        setBookings(data);
      } catch (consoleError) {
        console.error(consoleError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const upcoming = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const history = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">No bookings found</h3>
        <p className="mt-2 text-text-muted text-sm max-w-sm mx-auto">
          Your bookings and their status will appear here once you request a quote.
        </p>
        <div className="mt-6">
          <Link href="/quote" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 font-semibold" data-testid="button-dashboard-get-quote">
              Get a Quote
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards bookings={bookings} />
      <Tabs defaultValue="upcoming">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming" className="flex-1 sm:flex-none">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history" className="flex-1 sm:flex-none">History ({history.length})</TabsTrigger>
          </TabsList>
          <Link href="/quote" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto h-10 font-semibold" data-testid="button-new-booking">New Booking</Button>
          </Link>
        </div>
        <TabsContent value="upcoming" className="space-y-3 pt-1">
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
        <TabsContent value="history" className="space-y-3 pt-1">
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

  if (!loading && isAdmin(user)) return <Redirect to="/dashboard/admin" />;
  if (!loading && isTechnician(user)) return <Redirect to="/dashboard/technician" />;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Dashboard</h1>
          {!loading && user && (
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">Welcome back, {user.name}</p>
          )}
        </div>
        <Link href="/profile" className="text-sm font-semibold text-primary hover:underline" data-testid="link-profile">
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
