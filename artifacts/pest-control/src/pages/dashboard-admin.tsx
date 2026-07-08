import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "wouter";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/api";
import type {
  AdminAnalytics,
  Booking,
  BookingStatus,
  LocalUser,
  Review,
  ServiceItem,
  TechnicianRecord,
} from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import StarRating from "@/components/star-rating";
import BookingTimeline from "@/components/booking-timeline";
import { useUserContext } from "@/lib/user-context";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS: BookingStatus[] = [
  "pending", "confirmed", "technician-assigned", "en-route", "in-progress", "completed", "cancelled",
];

const EMPTY_FORM = {
  name: "", email: "", phone: "", specialization: "",
  experience: "", city: "", profileImage: "", specialties: "",
};

const PIE_COLORS = ["#2a6641", "#3d8b5c", "#a3c4bc", "#e3b04b", "#c0392b", "#7f8c8d", "#2c3e50"];

// ─── Analytics cards ──────────────────────────────────────────────────────────

function AnalyticsCards({ analytics }: { analytics: AdminAnalytics }) {
  const pending = analytics.bookingsByStatus["pending"] ?? 0;
  const completed = analytics.bookingsByStatus["completed"] ?? 0;
  const cancelled = analytics.bookingsByStatus["cancelled"] ?? 0;

  const summaryCards = [
    { label: "Total Bookings", value: analytics.totalBookings },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
    { label: "Cancelled", value: cancelled },
    { label: "Customers", value: analytics.totalCustomers },
    { label: "Active Technicians", value: analytics.totalTechnicians },
    {
      label: "Avg. Rating",
      value: analytics.averageRating ? `${analytics.averageRating.toFixed(1)} ★ (${analytics.reviewCount})` : "—",
    },
    {
      label: "Total Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`,
    },
  ];

  const revenueCards = [
    { label: "Today's Revenue", value: `₹${analytics.todayRevenue.toLocaleString("en-IN")}` },
    { label: "Monthly Revenue", value: `₹${analytics.monthlyRevenue.toLocaleString("en-IN")}` },
    { label: "Avg. Booking Value", value: analytics.avgBookingValue ? `₹${analytics.avgBookingValue.toLocaleString("en-IN")}` : "—" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-text-muted uppercase tracking-wide">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
            <p className="text-xs text-primary/70 uppercase tracking-wide font-medium">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function ChartsSection({ analytics }: { analytics: AdminAnalytics }) {
  const statusData = Object.entries(analytics.bookingsByStatus).map(([name, value]) => ({
    name: name.replace(/-/g, " "),
    value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Bookings */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h4 className="text-sm font-semibold mb-4">Monthly Bookings (last 6 months)</h4>
        {analytics.monthlyBookings.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No booking data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.monthlyBookings} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2a6641" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Booking Status Distribution */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h4 className="text-sm font-semibold mb-4">Booking Status Distribution</h4>
        {statusData.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No booking data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={10}>
                {statusData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue Trend */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-2">
        <h4 className="text-sm font-semibold mb-4">Revenue Trend (last 6 months)</h4>
        {analytics.revenueByMonth.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No revenue data yet. Revenue is tracked from completed payments.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.revenueByMonth} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#2a6641" strokeWidth={2.5} dot={{ fill: "#2a6641", r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── Booking detail modal ─────────────────────────────────────────────────────

function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const service = typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;
  const customer = typeof booking.customerId === "object" ? booking.customerId : undefined;
  const technician = typeof booking.technicianId === "object" ? booking.technicianId : undefined;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {booking.bookingNumber}
            <StatusBadge status={booking.status} />
          </DialogTitle>
          <DialogDescription>{service?.name ?? "Service"}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Customer */}
          <section className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Customer</p>
            <p><span className="text-text-muted">Name:</span> {customer?.name ?? "—"}</p>
            <p><span className="text-text-muted">Email:</span> {customer?.email ?? "—"}</p>
            <p><span className="text-text-muted">Phone:</span> {customer?.phone ?? "—"}</p>
          </section>

          {/* Service + Schedule */}
          <section className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Details</p>
            <p><span className="text-text-muted">Service:</span> {service?.name ?? "—"}</p>
            <p><span className="text-text-muted">Scheduled:</span> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} {booking.timeSlot ? `(${booking.timeSlot})` : ""}</p>
            <p><span className="text-text-muted">Property:</span> {booking.propertyType ?? "—"}</p>
            {booking.areaSize && <p><span className="text-text-muted">Area:</span> {booking.areaSize} sq ft</p>}
          </section>

          {/* Address */}
          <section className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Address</p>
            {booking.address ? (
              <>
                {booking.address.line1 && <p>{booking.address.line1}</p>}
                {booking.address.line2 && <p>{booking.address.line2}</p>}
                <p>{[booking.address.city, booking.address.state, booking.address.pincode].filter(Boolean).join(", ") || "—"}</p>
                {booking.address.landmark && <p className="text-text-muted">Near: {booking.address.landmark}</p>}
              </>
            ) : <p className="text-text-muted">No address provided</p>}
          </section>

          {/* Technician + Payment */}
          <section className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Assignment & Payment</p>
            <p><span className="text-text-muted">Technician:</span> {technician?.name ?? "Not assigned"}</p>
            <p><span className="text-text-muted">Price:</span> {booking.price ? `₹${booking.price.toLocaleString("en-IN")}` : "—"}</p>
            <p><span className="text-text-muted">Payment:</span> <span className="capitalize">{booking.paymentStatus}</span></p>
            {booking.emergency && <p className="text-danger font-medium">⚡ Emergency request</p>}
          </section>
        </div>

        {/* Notes */}
        {booking.notes && (
          <section className="rounded-lg border border-border p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Notes</p>
            <p>{booking.notes}</p>
          </section>
        )}

        {/* Status history */}
        {booking.statusHistory?.length > 0 && (
          <section className="rounded-lg border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">Status History</p>
            <BookingTimeline history={booking.statusHistory} />
          </section>
        )}

        <div className="flex justify-end pt-2">
          <Link href={`/bookings/${booking._id}`}>
            <Button variant="outline" size="sm">Open Full Page</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bookings tab (with filters + modal) ─────────────────────────────────────

function BookingsTab({ technicians, onMutate }: { technicians: TechnicianRecord[]; onMutate?: () => void }) {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function loadBookings() {
    setLoading(true);
    try {
      const token = await getToken();
      const [bData, sData] = await Promise.all([
        apiFetch<Booking[]>("/bookings", { token }),
        apiFetch<ServiceItem[]>("/services"),
      ]);
      setBookings(bData);
      setServices(sData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), token });
    loadBookings();
    onMutate?.();
  }

  async function assignTechnician(id: string, userId: string) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "technician-assigned", technicianId: userId }),
      token,
    });
    loadBookings();
    onMutate?.();
  }

  async function deleteBooking() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await apiFetch(`/bookings/${deleteTarget._id}`, { method: "DELETE", token });
      toast({ title: "Booking deleted" });
      setDeleteTarget(null);
      loadBookings();
      onMutate?.();
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  // Client-side filtering
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const customer = typeof b.customerId === "object" ? b.customerId : undefined;
      const service = typeof b.serviceId === "object" ? b.serviceId : undefined;
      const technician = typeof b.technicianId === "object" ? b.technicianId : undefined;

      if (search) {
        const q = search.toLowerCase();
        const match =
          b.bookingNumber.toLowerCase().includes(q) ||
          customer?.name.toLowerCase().includes(q) ||
          customer?.email?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (serviceFilter !== "all" && service?._id !== serviceFilter) return false;
      if (technicianFilter !== "all" && technician?._id !== technicianFilter) return false;
      if (dateFrom) {
        const d = b.scheduledDate ? new Date(b.scheduledDate) : null;
        if (!d || d < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const d = b.scheduledDate ? new Date(b.scheduledDate) : null;
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (!d || d > to) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, serviceFilter, technicianFilter, dateFrom, dateTo]);

  const assignable = technicians.filter((t) => t.userId && t.status === "active");

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  if (error) return <p className="p-6 text-danger" data-testid="text-error">{error}</p>;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search booking # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            data-testid="input-bookings-search"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-service">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-technician">
              <SelectValue placeholder="All technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {assignable.map((t) => <SelectItem key={t._id} value={t.userId!._id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 h-8 text-xs" data-testid="input-filter-date-from" />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 h-8 text-xs" data-testid="input-filter-date-to" />
          </div>
          {(search || statusFilter !== "all" || serviceFilter !== "all" || technicianFilter !== "all" || dateFrom || dateTo) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setSearch(""); setStatusFilter("all"); setServiceFilter("all"); setTechnicianFilter("all"); setDateFrom(""); setDateTo(""); }}
            >
              Clear Filters
            </Button>
          )}
          <span className="text-xs text-text-muted ml-auto">{filtered.length} / {bookings.length} bookings</span>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((b) => {
            const customer = typeof b.customerId === "object" ? b.customerId : undefined;
            const service = typeof b.serviceId === "object" ? b.serviceId : undefined;
            const technician = typeof b.technicianId === "object" ? b.technicianId : undefined;
            const isDone = b.status === "completed" || b.status === "cancelled";
            return (
              <TableRow
                key={b._id}
                className="cursor-pointer hover:bg-secondary/30"
                data-testid={`row-booking-${b._id}`}
                onClick={(e) => {
                  // Don't open modal when clicking interactive elements
                  if ((e.target as HTMLElement).closest("button,select,[role='combobox']")) return;
                  setSelectedBooking(b);
                }}
              >
                <TableCell>
                  <span className="text-primary font-mono text-sm">{b.bookingNumber}</span>
                </TableCell>
                <TableCell>{customer?.name ?? "—"}</TableCell>
                <TableCell>{service?.name ?? "—"}</TableCell>
                <TableCell>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={technician?._id ?? ""} onValueChange={(v) => assignTechnician(b._id, v)}>
                    <SelectTrigger className="w-[140px]" data-testid={`select-technician-${b._id}`}>
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignable.map((t) => (
                        <SelectItem key={t._id} value={t.userId!._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={b.status} onValueChange={(v) => updateStatus(b._id, v as BookingStatus)}>
                    <SelectTrigger className="w-[150px]" data-testid={`select-status-${b._id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {isDone && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(b)}
                      data-testid={`button-delete-booking-${b._id}`}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-text-muted py-10">
                {bookings.length === 0 ? (
                  <span>No bookings yet.</span>
                ) : (
                  <span>No bookings match the current filters.</span>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}

      {/* Delete booking confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete booking <strong>{deleteTarget?.bookingNumber}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteBooking}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Customers tab ────────────────────────────────────────────────────────────

function CustomersTab() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<LocalUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await apiFetch<LocalUser[]>("/admin/customers", { token });
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCustomers(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await apiFetch(`/admin/customers/${deleteTarget._id}`, { method: "DELETE", token });
      toast({ title: "Customer removed" });
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="p-6 space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c._id} data-testid={`row-customer-${c._id}`}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(c)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-text-muted py-10">
                <div>
                  <p className="text-base font-medium">No customers yet</p>
                  <p className="text-sm mt-1">Customers will appear here once they sign up and make a booking.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? Their reviews will also be deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Technicians tab (full CRUD — unchanged) ──────────────────────────────────

function TechniciansTab({
  technicians,
  onRefresh,
}: {
  technicians: TechnicianRecord[];
  onRefresh: () => void;
}) {
  const { getToken } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TechnicianRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TechnicianRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() { setForm(EMPTY_FORM); setAddOpen(true); }
  function openEdit(t: TechnicianRecord) {
    setForm({
      name: t.name, email: t.email, phone: t.phone ?? "",
      specialization: t.specialization ?? "",
      experience: t.experience !== undefined ? String(t.experience) : "",
      city: t.city ?? "", profileImage: t.profileImage ?? "",
      specialties: t.specialties?.join(", ") ?? "",
    });
    setEditTarget(t);
  }
  function closeDialogs() { setAddOpen(false); setEditTarget(null); }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        city: form.city.trim() || undefined,
        profileImage: form.profileImage.trim() || undefined,
        specialties: form.specialties ? form.specialties.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editTarget) {
        await apiFetch(`/admin/technicians/${editTarget._id}`, { method: "PATCH", body: JSON.stringify(body), token });
        toast({ title: "Technician updated" });
      } else {
        await apiFetch("/admin/technicians", { method: "POST", body: JSON.stringify(body), token });
        toast({ title: "Technician added" });
      }
      closeDialogs();
      onRefresh();
    } catch (err) {
      toast({ title: editTarget ? "Update failed" : "Add failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const token = await getToken();
      await apiFetch(`/admin/technicians/${deleteTarget._id}`, { method: "DELETE", token });
      toast({ title: "Technician removed" });
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(t: TechnicianRecord) {
    try {
      const token = await getToken();
      await apiFetch(`/admin/technicians/${t._id}/status`, { method: "PATCH", token });
      toast({ title: t.status === "active" ? "Technician deactivated" : "Technician activated" });
      onRefresh();
    } catch (err) {
      toast({ title: "Status update failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  }

  const formFields = (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1 col-span-2 md:col-span-1">
        <Label htmlFor="t-name">Full Name *</Label>
        <Input id="t-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-1 col-span-2 md:col-span-1">
        <Label htmlFor="t-email">Email *</Label>
        <Input id="t-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="t-phone">Phone</Label>
        <Input id="t-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="t-city">City</Label>
        <Input id="t-city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="t-spec">Specialization</Label>
        <Input id="t-spec" value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="t-exp">Experience (years)</Label>
        <Input id="t-exp" type="number" min={0} value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} />
      </div>
      <div className="space-y-1 col-span-2">
        <Label htmlFor="t-specialties">Specialties (comma-separated)</Label>
        <Input id="t-specialties" value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="Termite, Rodent, Cockroach" />
      </div>
      <div className="space-y-1 col-span-2">
        <Label htmlFor="t-image">Profile Image URL</Label>
        <Input id="t-image" value={form.profileImage} onChange={(e) => setForm((f) => ({ ...f, profileImage: e.target.value }))} placeholder="https://..." />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex justify-end p-3 border-b border-border">
        <Button size="sm" onClick={openAdd} data-testid="button-add-technician">+ Add Technician</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Exp.</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((t) => (
            <TableRow key={t._id} data-testid={`row-technician-${t._id}`}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.email}</TableCell>
              <TableCell>{t.phone ?? "—"}</TableCell>
              <TableCell>{t.specialization ?? "—"}</TableCell>
              <TableCell>{t.city ?? "—"}</TableCell>
              <TableCell>{t.experience !== undefined ? `${t.experience}y` : "—"}</TableCell>
              <TableCell>{t.rating > 0 ? `${t.rating.toFixed(1)} ★` : "—"}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {t.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)} data-testid={`button-edit-technician-${t._id}`}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleStatus(t)} data-testid={`button-toggle-technician-${t._id}`}>
                    {t.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(t)} data-testid={`button-delete-technician-${t._id}`}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {technicians.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                <div>
                  <p className="text-base font-medium text-text-muted">No technicians yet</p>
                  <p className="text-sm text-text-muted mt-1">Click &quot;Add Technician&quot; to get started.</p>
                  <Button size="sm" className="mt-4" onClick={openAdd}>+ Add First Technician</Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) closeDialogs(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Technician</DialogTitle>
            <DialogDescription>Fill in the technician's details. They can register via Clerk later.</DialogDescription>
          </DialogHeader>
          {formFields}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-confirm-add-technician">
              {saving ? "Saving..." : "Add Technician"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) closeDialogs(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>Update the technician's profile details.</DialogDescription>
          </DialogHeader>
          {formFields}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-confirm-edit-technician">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Technician</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              data-testid="button-confirm-delete-technician"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Reviews tab ──────────────────────────────────────────────────────────────

interface BookingMapPoint {
  city: string;
  count: number;
  lat: number;
  lng: number;
}

// Default view centered on Odisha, India — the business's home region.
const DEFAULT_MAP_CENTER: [number, number] = [20.9517, 85.0985];
const DEFAULT_MAP_ZOOM = 6;

function ServiceMapTab() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [points, setPoints] = useState<BookingMapPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ points: BookingMapPoint[] }>("/admin/bookings/map");
        if (!cancelled) setPoints(data.points);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load booking locations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || loading || error) return;

    let cancelled = false;
    let markers: import("leaflet").CircleMarker[] = [];

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapContainerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;

      const maxCount = Math.max(1, ...(points ?? []).map((p) => p.count));
      markers = (points ?? []).map((point) => {
        const radius = 8 + (point.count / maxCount) * 20;
        const marker = L.circleMarker([point.lat, point.lng], {
          radius,
          color: "#7c3aed",
          fillColor: "#7c3aed",
          fillOpacity: 0.45,
          weight: 2,
        }).addTo(map);
        marker.bindPopup(
          `<strong>${point.city.replace(/\b\w/g, (c) => c.toUpperCase())}</strong><br/>${point.count} booking${point.count === 1 ? "" : "s"}`,
        );
        return marker;
      });

      if (points && points.length > 0) {
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.3));
      }
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
    };
  }, [points, loading, error]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4" data-testid="service-map-tab">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-text-muted">
          Booking locations plotted by city. Marker size reflects booking volume.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-6 h-[480px] flex items-center justify-center text-sm text-text-muted">
          Loading map…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">{error}</div>
      ) : points && points.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 h-[480px] flex items-center justify-center text-sm text-text-muted">
          No booking locations to show yet.
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="rounded-xl border border-border overflow-hidden h-[480px] w-full"
          data-testid="service-map-container"
        />
      )}
    </div>
  );
}

function ReviewsTab() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadReviews() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await apiFetch<Review[]>("/admin/reviews", { token });
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await apiFetch(`/admin/reviews/${deleteTarget._id}`, { method: "DELETE", token });
      toast({ title: "Review deleted" });
      setDeleteTarget(null);
      loadReviews();
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="p-6 space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-3 p-2">
        {reviews.map((r) => {
          const customer = typeof r.customerId === "object" ? r.customerId : undefined;
          const service = typeof r.serviceId === "object" ? r.serviceId : undefined;
          return (
            <div key={r._id} className="rounded-lg border border-border p-4" data-testid={`review-${r._id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="font-medium truncate">{customer?.name ?? "Anonymous"}</p>
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(r)} className="shrink-0">Delete</Button>
              </div>
              <p className="text-xs text-text-muted mt-0.5">{service?.name}</p>
              <p className="text-sm mt-2">{r.comment}</p>
            </div>
          );
        })}
        {reviews.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-text-muted">No reviews yet</p>
            <p className="text-sm text-text-muted mt-1">Customer reviews will appear here once services are completed.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  const { getToken } = useAuth();
  const { user, loading: userLoading } = useUserContext();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianRecord[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  async function loadData() {
    setAnalyticsLoading(true);
    try {
      const token = await getToken();
      const [a, t] = await Promise.all([
        apiFetch<AdminAnalytics>("/admin/analytics", { token }),
        apiFetch<TechnicianRecord[]>("/admin/technicians", { token }),
      ]);
      setAnalytics(a);
      setTechnicians(t);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-primary">Admin Dashboard</h1>
          {!userLoading && user && (
            <p className="text-sm text-text-muted mt-0.5">Logged in as {user.name} · Admin</p>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {/* Analytics cards */}
        {analyticsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : analytics ? (
          <AnalyticsCards analytics={analytics} />
        ) : null}

        {/* Management tabs */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <h3>Admin Overview</h3>
            <p className="mt-1 text-sm text-text-muted">Manage bookings, customers, technicians, reviews, and analytics.</p>
          </div>
          <Tabs defaultValue="bookings" className="p-4">
            <TabsList>
              <TabsTrigger value="bookings" data-testid="tab-admin-bookings">Bookings</TabsTrigger>
              <TabsTrigger value="customers" data-testid="tab-admin-customers">Customers</TabsTrigger>
              <TabsTrigger value="technicians" data-testid="tab-admin-technicians">Technicians</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-admin-reviews">Reviews</TabsTrigger>
              <TabsTrigger value="charts" data-testid="tab-admin-charts">Charts</TabsTrigger>
              <TabsTrigger value="sitemap" data-testid="tab-admin-sitemap">Sitemap</TabsTrigger>
            </TabsList>
            <TabsContent value="bookings">
              <BookingsTab technicians={technicians} onMutate={loadData} />
            </TabsContent>
            <TabsContent value="customers">
              <CustomersTab />
            </TabsContent>
            <TabsContent value="technicians">
              <TechniciansTab technicians={technicians} onRefresh={loadData} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab />
            </TabsContent>
            <TabsContent value="charts" className="pt-2">
              {analytics ? (
                <ChartsSection analytics={analytics} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 h-48 animate-pulse" />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="sitemap" className="pt-2">
              <SitemapTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
