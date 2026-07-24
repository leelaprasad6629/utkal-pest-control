import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiFetch, ApiError } from "@/lib/api";
import type { Booking, ServiceItem } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/user-context";

// ─── Complete job dialog ──────────────────────────────────────────────────────

function CompleteJobDialog({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [beforeImages, setBeforeImages] = useState("");
  const [afterImages, setAfterImages] = useState("");
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleComplete() {
    if (!signature.trim()) {
      toast({ title: "Customer signature (typed name) is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch(`/technician/jobs/${booking._id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          notes,
          beforeImages: beforeImages ? beforeImages.split(",").map((s) => s.trim()).filter(Boolean) : [],
          afterImages: afterImages ? afterImages.split(",").map((s) => s.trim()).filter(Boolean) : [],
          customerSignature: signature,
        }),
        token,
      });
      toast({ title: "Job marked complete" });
      setOpen(false);
      onDone();
    } catch (err) {
      toast({ title: "Could not complete job", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid={`button-complete-${booking._id}`}>Complete Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Job — {booking.bookingNumber}</DialogTitle>
          <DialogDescription>Record photos, notes, and get the customer's signature.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="before-images">Before Photo URLs (comma separated)</Label>
            <Input id="before-images" value={beforeImages} onChange={(e) => setBeforeImages(e.target.value)} data-testid="input-before-images" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="after-images">After Photo URLs (comma separated)</Label>
            <Input id="after-images" value={afterImages} onChange={(e) => setAfterImages(e.target.value)} data-testid="input-after-images" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Service Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-service-notes" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature">Customer Signature (type full name)</Label>
            <Input id="signature" value={signature} onChange={(e) => setSignature(e.target.value)} data-testid="input-signature" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleComplete} disabled={submitting} data-testid="button-confirm-complete">
            {submitting ? "Submitting..." : "Mark Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({ booking, onAction }: { booking: Booking; onAction: () => void }) {
  const { getToken } = useAuth();
  const customer = typeof booking.customerId === "object" ? booking.customerId : undefined;
  const service = typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;
  const [acting, setActing] = useState(false);

  async function markEnRoute() {
    setActing(true);
    try {
      const token = await getToken();
      await apiFetch(`/technician/jobs/${booking._id}/en-route`, { method: "POST", token });
      toast({ title: "Status updated to En Route" });
      onAction();
    } catch (err) {
      toast({ title: "Could not update status", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setActing(false);
    }
  }

  async function startJob() {
    setActing(true);
    try {
      const token = await getToken();
      await apiFetch(`/technician/jobs/${booking._id}/start`, { method: "POST", token });
      toast({ title: "Job started" });
      onAction();
    } catch (err) {
      toast({ title: "Could not start job", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setActing(false);
    }
  }

  const isToday = booking.scheduledDate
    ? new Date(booking.scheduledDate).toDateString() === new Date().toDateString()
    : false;

  const canMarkEnRoute = booking.status === "technician-assigned";
  const canStart = booking.status === "en-route";
  const canComplete = booking.status === "in-progress";

  return (
    <div
      className={`rounded-xl border ${isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"} p-5 shadow-sm`}
      data-testid={`card-job-${booking._id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{service?.name ?? "Service"}</p>
            {isToday && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                Today
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{booking.bookingNumber} · {customer?.name ?? "Customer"}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Job details */}
      <div className="mt-3 text-sm text-text-muted space-y-1">
        <p><span className="font-medium text-foreground/70">Address:</span> {[booking.address?.line1, booking.address?.city, booking.address?.pincode].filter(Boolean).join(", ") || "—"}</p>
        <p>
          <span className="font-medium text-foreground/70">Date:</span>{" "}
          {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          {booking.timeSlot && ` · ${booking.timeSlot}`}
        </p>
        {customer?.phone && <p><span className="font-medium text-foreground/70">Contact:</span> {customer.phone}</p>}
        {booking.notes && <p><span className="font-medium text-foreground/70">Notes:</span> {booking.notes}</p>}
        {booking.price && <p><span className="font-medium text-foreground/70">Value:</span> ₹{booking.price.toLocaleString("en-IN")}</p>}
      </div>

      {/* Status progress hint */}
      <div className="mt-3 text-xs text-text-muted/70 flex items-center gap-1">
        {canMarkEnRoute && <span>Next: Mark yourself En Route → Start Job → Complete</span>}
        {canStart && <span>Next: Start Job → Complete</span>}
        {canComplete && <span>Next: Mark Complete (customer signature required)</span>}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {canMarkEnRoute && (
          <Button size="sm" variant="outline" onClick={markEnRoute} disabled={acting} data-testid={`button-enroute-${booking._id}`}>
            {acting ? "Updating..." : "Mark En Route"}
          </Button>
        )}
        {canStart && (
          <Button size="sm" variant="outline" onClick={startJob} disabled={acting} data-testid={`button-start-${booking._id}`}>
            {acting ? "Starting..." : "Start Job"}
          </Button>
        )}
        {canComplete && <CompleteJobDialog booking={booking} onDone={onAction} />}
      </div>
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ bookings }: { bookings: Booking[] }) {
  const assigned = bookings.filter((b) => !["completed", "cancelled"].includes(b.status)).length;
  const pending = bookings.filter((b) => b.status === "technician-assigned" || b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const today = bookings.filter(
    (b) => b.scheduledDate && new Date(b.scheduledDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Assigned Jobs", value: assigned, icon: "🔧" },
        { label: "Pending Jobs", value: pending, icon: "⏳" },
        { label: "Completed", value: completed, icon: "✅" },
        { label: "Today's Schedule", value: today, icon: "📅" },
      ].map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xl mb-1">{c.icon}</p>
          <p className="text-xl font-semibold text-primary">{c.value}</p>
          <p className="text-xs text-text-muted mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardTechnician() {
  const { user, loading: userLoading } = useUserContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function load() {
    setLoading(true);
    setProfileError(null);
    setError(null);
    try {
      const token = await getToken();
      // Check if this technician has been set up by admin before loading jobs.
      // A 404 with code NO_TECHNICIAN_PROFILE means admin hasn't created a profile yet.
      try {
        await apiFetch("/technician/profile", { token });
      } catch (profileErr) {
        if (profileErr instanceof ApiError && profileErr.code === "NO_TECHNICIAN_PROFILE") {
          setProfileError("No technician profile found. Contact administrator.");
          return;
        }
        // Any other error (403, 500, network) — surface it as a generic error
        throw profileErr;
      }
      const data = await apiFetch<Booking[]>("/technician/jobs", { token });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const active = bookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  const todayJobs = bookings.filter(
    (b) => b.scheduledDate && new Date(b.scheduledDate).toDateString() === new Date().toDateString()
  );
  const completed = bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Technician Portal</h1>
          {!userLoading && user && (
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">Welcome, {user.name} · Technician</p>
          )}
        </div>
        <Link href="/profile" className="text-sm font-semibold text-primary hover:underline">My Profile →</Link>
      </header>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse" />
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-5 h-28 animate-pulse" />
          <div className="rounded-xl border border-border bg-card p-5 h-28 animate-pulse" />
        </div>
      )}

      {/* No Technician profile guard — shown when admin hasn't set up this account yet */}
      {!loading && profileError && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-6 sm:p-8 text-center shadow-2xs" data-testid="technician-no-profile">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-foreground">No Technician Profile Found</h3>
          <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
            {profileError}
          </p>
          <p className="mt-3 text-xs text-text-muted">
            Your account is logged in as <strong>{user?.email}</strong>. Ask your administrator to add you as a technician in the Admin Dashboard.
          </p>
        </div>
      )}

      {error && <p className="text-danger" data-testid="text-error">{error}</p>}

      {!loading && !error && !profileError && (
        <>
          <SummaryCards bookings={bookings} />

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center shadow-2xs">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-foreground">No jobs assigned yet</h3>
              <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
                Your assigned jobs will appear here once the admin assigns bookings to you.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="active">
              <div className="w-full overflow-x-auto no-scrollbar mb-4">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="active" className="flex-1 sm:flex-none">Active ({active.length})</TabsTrigger>
                  <TabsTrigger value="today" className="flex-1 sm:flex-none">Today ({todayJobs.length})</TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 sm:flex-none">Completed ({completed.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="active" className="space-y-4">
                {active.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-text-muted text-sm font-medium">All jobs completed — great work!</p>
                  </div>
                ) : (
                  active.map((b) => <JobCard key={b._id} booking={b} onAction={load} />)
                )}
              </TabsContent>

              <TabsContent value="today" className="space-y-4">
                {todayJobs.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <div className="text-3xl mb-3">📅</div>
                    <p className="text-text-muted text-sm">No jobs scheduled for today.</p>
                  </div>
                ) : (
                  todayJobs.map((b) => <JobCard key={b._id} booking={b} onAction={load} />)
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completed.length === 0 ? (
                  <p className="text-center text-text-muted py-8 text-sm">No completed jobs yet.</p>
                ) : (
                  completed.map((b) => <JobCard key={b._id} booking={b} onAction={load} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
