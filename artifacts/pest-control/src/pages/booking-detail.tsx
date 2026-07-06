import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { Booking, Invoice, ServiceItem } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import BookingTimeline from "@/components/booking-timeline";
import StarRating from "@/components/star-rating";
import { toast } from "@/hooks/use-toast";

const TIME_SLOTS = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingDetail() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState(TIME_SLOTS[0]);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await apiFetch<Booking>(`/bookings/${params.id}`, { token });
      setBooking(data);
      if (data.status === "completed") {
        try {
          const invoices = await apiFetch<Invoice[]>("/invoices", { token });
          const match = invoices.find((inv) => {
            const bId = typeof inv.bookingId === "string" ? inv.bookingId : inv.bookingId._id;
            return bId === data._id;
          });
          setInvoice(match ?? null);
        } catch {
          // invoices are supplementary; ignore failures
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function handleReschedule() {
    if (!newDate) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch(`/bookings/${params.id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ scheduledDate: new Date(newDate).toISOString(), timeSlot: newTimeSlot }),
        token,
      });
      toast({ title: "Booking rescheduled" });
      setRescheduleOpen(false);
      load();
    } catch (err) {
      toast({ title: "Reschedule failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch(`/bookings/${params.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason }),
        token,
      });
      toast({ title: "Booking cancelled" });
      setCancelOpen(false);
      load();
    } catch (err) {
      toast({ title: "Cancellation failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReviewSubmit() {
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ bookingId: params.id, rating: reviewRating, comment: reviewComment }),
        token,
      });
      setReviewSubmitted(true);
      toast({ title: "Thanks for your feedback!" });
    } catch (err) {
      toast({ title: "Could not submit review", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayNow() {
    if (!booking) return;
    setPaying(true);
    try {
      const token = await getToken();
      const config = await apiFetch<{ configured: boolean; keyId: string | null }>("/payments/config");
      if (!config.configured) {
        toast({
          title: "Online payments unavailable",
          description: "Payment gateway isn't configured yet. Please contact us to arrange payment.",
          variant: "destructive",
        });
        return;
      }
      const order = await apiFetch<{ orderId: string; amount: number; currency: string; keyId: string }>(
        "/payments/create-order",
        { method: "POST", body: JSON.stringify({ bookingId: booking._id }), token },
      );
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast({ title: "Could not load payment gateway", variant: "destructive" });
        return;
      }
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Utkal Pest Control",
        description: `Booking ${booking.bookingNumber}`,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await apiFetch("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
              token,
            });
            toast({ title: "Payment successful" });
            load();
          } catch (err) {
            toast({ title: "Payment verification failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
          }
        },
        theme: { color: "#2f5233" },
      });
      rzp.open();
    } catch (err) {
      toast({ title: "Could not start payment", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 md:px-6 py-14 text-text-muted">Loading booking...</main>;
  }

  if (error || !booking) {
    return (
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-14">
        <p className="text-danger" data-testid="text-error">{error ?? "Booking not found"}</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">Back to dashboard</Link>
      </main>
    );
  }

  const service = typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;
  const technician = typeof booking.technicianId === "object" ? booking.technicianId : undefined;
  const canCancel = !["completed", "cancelled"].includes(booking.status);
  const canReschedule = canCancel;
  const canReview = booking.status === "completed" && !reviewSubmitted;
  const canPay = booking.status !== "cancelled" && booking.paymentStatus !== "paid" && Boolean(booking.price);

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      <Link href="/dashboard" className="text-sm text-primary hover:underline" data-testid="link-back-dashboard">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-primary" data-testid="text-booking-number">{booking.bookingNumber}</h1>
          <p className="mt-1 text-text-muted">{service?.name ?? "Service"}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4">Status Timeline</h3>
            <BookingTimeline history={booking.statusHistory} />
          </section>

          {booking.status === "completed" && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3">Leave a Review</h3>
              {canReview ? (
                <div className="space-y-3">
                  <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    data-testid="input-review-comment"
                  />
                  <Button
                    onClick={handleReviewSubmit}
                    disabled={submitting || !reviewComment.trim()}
                    data-testid="button-submit-review"
                  >
                    Submit Review
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-success">Thanks — your review has been submitted!</p>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Details</h4>
            <div className="text-sm space-y-2">
              <p><span className="text-text-muted">Scheduled:</span> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "—"} {booking.timeSlot && `(${booking.timeSlot})`}</p>
              <p><span className="text-text-muted">Address:</span> {[booking.address?.line1, booking.address?.city, booking.address?.pincode].filter(Boolean).join(", ") || "—"}</p>
              <p><span className="text-text-muted">Technician:</span> {technician ? technician.name : "Not yet assigned"}</p>
              <p><span className="text-text-muted">Price:</span> {booking.price ? `₹${booking.price}` : "—"}</p>
              <p><span className="text-text-muted">Payment:</span> <span className="capitalize">{booking.paymentStatus}</span></p>
              {booking.notes && <p><span className="text-text-muted">Notes:</span> {booking.notes}</p>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            {canPay && (
              <Button className="w-full" onClick={handlePayNow} disabled={paying} data-testid="button-pay-now">
                {paying ? "Starting payment..." : `Pay ₹${booking.price}`}
              </Button>
            )}

            {invoice && (
              <a
                href={`/invoices/${invoice._id}`}
                className="block text-center text-sm font-medium text-primary hover:underline"
                data-testid="link-view-invoice"
              >
                View invoice #{invoice.invoiceNumber}
              </a>
            )}

            {canReschedule && (
              <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" data-testid="button-reschedule">
                    Reschedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reschedule Booking</DialogTitle>
                    <DialogDescription>Choose a new date and time slot.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-date">New Date</Label>
                      <Input
                        id="new-date"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        data-testid="input-reschedule-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time Slot</Label>
                      <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                        <SelectTrigger data-testid="select-reschedule-time"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReschedule} disabled={submitting || !newDate} data-testid="button-confirm-reschedule">
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {canCancel && (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full" data-testid="button-cancel-booking">
                    Cancel Booking
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Booking</DialogTitle>
                    <DialogDescription>Let us know why you're cancelling (optional).</DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    data-testid="input-cancel-reason"
                  />
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleCancel} disabled={submitting} data-testid="button-confirm-cancel">
                      Confirm Cancellation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
