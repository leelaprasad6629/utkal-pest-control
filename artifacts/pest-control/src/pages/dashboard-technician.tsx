import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function DashboardTechnician() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  async function startJob(id: string) {
    const token = await getToken();
    await apiFetch(`/technician/jobs/${id}/start`, { method: "POST", token });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <h3>Technician Dashboard</h3>
        <p className="mt-1 text-sm text-text-muted">Your assigned jobs.</p>
      </div>

      {loading && <p className="text-text-muted">Loading jobs...</p>}
      {error && <p className="text-danger" data-testid="text-error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-center text-text-muted py-10 rounded-xl border border-border bg-card">No jobs assigned yet.</p>
      )}

      {!loading && !error && bookings.map((b) => {
        const customer = typeof b.customerId === "object" ? b.customerId : undefined;
        const service = typeof b.serviceId === "object" ? (b.serviceId as ServiceItem) : undefined;
        return (
          <div key={b._id} className="rounded-xl border border-border bg-card p-5 shadow-sm" data-testid={`card-job-${b._id}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{service?.name ?? "Service"}</p>
                <p className="text-xs text-text-muted mt-0.5">{b.bookingNumber} · {customer?.name}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-3 text-sm text-text-muted space-y-1">
              <p>{[b.address?.line1, b.address?.city, b.address?.pincode].filter(Boolean).join(", ")}</p>
              <p>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"} {b.timeSlot && `· ${b.timeSlot}`}</p>
              {customer?.phone && <p>Contact: {customer.phone}</p>}
              {b.notes && <p>Notes: {b.notes}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              {(b.status === "technician-assigned" || b.status === "confirmed" || b.status === "en-route") && (
                <Button size="sm" variant="outline" onClick={() => startJob(b._id)} data-testid={`button-start-${b._id}`}>
                  Start Job
                </Button>
              )}
              {b.status === "in-progress" && <CompleteJobDialog booking={b} onDone={load} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
