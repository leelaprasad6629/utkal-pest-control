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
import { apiFetch } from "@/lib/api";
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

  async function startJob() {
    const token = await getToken();
    await apiFetch(`/technician/jobs/${booking._id}/start`, { method: "POST", token });
    onAction();
  }

  const isToday = booking.scheduledDate
    ? new Date(booking.scheduledDate).toDateString() === new Date().toDateString()
    : false;

  return (
    <div
      key={booking._id}
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
      <div className="mt-3 text-sm text-text-muted space-y-1">
        <p>{[booking.address?.line1, booking.address?.city, booking.address?.pincode].filter(Boolean).join(", ") || "—"}</p>
        <p>
          {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          {booking.timeSlot && ` · ${booking.timeSlot}`}
        </p>
        {customer?.phone && <p>Contact: {customer.phone}</p>}
        {booking.notes && <p>Notes: {booking.notes}</p>}
      </div>
      <div className="mt-4 flex gap-2">
        {(booking.status === "technician-assigned" || booking.status === "confirmed" || booking.status === "en-route") && (
          <Button size="sm" variant="outline" onClick={startJob} data-testid={`button-start-${booking._id}`}>
            Start Job
          </Button>
        )}
        {booking.status === "in-progress" && <CompleteJobDialog booking={booking} onDone={onAction} />}
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
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function load() {
    setLoading(true);
    try {
      const token = await getToken();
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
    <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-primary">Technician Portal</h1>
          {!userLoading && user && (
            <p className="text-sm text-text-muted mt-0.5">Welcome, {user.name} · Technician</p>
          )}
        </div>
        <Link href="/profile" className="text-sm text-primary hover:underline">My Profile →</Link>
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

      {error && <p className="text-danger" data-testid="text-error">{error}</p>}

      {!loading && !error && (
        <>
          <SummaryCards bookings={bookings} />

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">🔧</div>
              <h3>No jobs assigned yet</h3>
              <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
                Your assigned jobs will appear here once the admin assigns bookings to you.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                <TabsTrigger value="today">Today ({todayJobs.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {active.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-text-muted text-sm">All jobs completed — great work!</p>
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
