import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import type {
  AdminAnalytics,
  Booking,
  BookingStatus,
  LocalUser,
  Review,
  TechnicianRecord,
} from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import StarRating from "@/components/star-rating";
import { useUserContext } from "@/lib/user-context";

const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "technician-assigned",
  "en-route",
  "in-progress",
  "completed",
  "cancelled",
];

function AnalyticsCards({ analytics }: { analytics: AdminAnalytics }) {
  const cards = [
    { label: "Total Bookings", value: analytics.totalBookings },
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString()}` },
    { label: "Customers", value: analytics.totalCustomers },
    { label: "Technicians", value: analytics.totalTechnicians },
    {
      label: "Avg. Rating",
      value: analytics.averageRating ? `${analytics.averageRating.toFixed(1)} ★ (${analytics.reviewCount})` : "—",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-text-muted uppercase tracking-wide">{c.label}</p>
          <p className="mt-1 text-xl font-semibold text-primary">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function BookingsTab({ technicians }: { technicians: TechnicianRecord[] }) {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await apiFetch<Booking[]>("/bookings", { token });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    });
    loadBookings();
  }

  async function assignTechnician(id: string, technicianId: string) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "technician-assigned", technicianId }),
      token,
    });
    loadBookings();
  }

  if (loading) return <p className="p-6 text-text-muted">Loading bookings...</p>;
  if (error) return <p className="p-6 text-danger" data-testid="text-error">{error}</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Technician</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => {
          const customer = typeof b.customerId === "object" ? b.customerId : undefined;
          const service = typeof b.serviceId === "object" ? b.serviceId : undefined;
          const technician = typeof b.technicianId === "object" ? b.technicianId : undefined;
          return (
            <TableRow key={b._id} data-testid={`row-booking-${b._id}`}>
              <TableCell>
                <Link href={`/bookings/${b._id}`} className="text-primary hover:underline text-sm">
                  {b.bookingNumber}
                </Link>
              </TableCell>
              <TableCell>{customer?.name ?? "—"}</TableCell>
              <TableCell>{service?.name ?? "—"}</TableCell>
              <TableCell>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"}</TableCell>
              <TableCell>
                <Select
                  value={technician?._id ?? ""}
                  onValueChange={(v) => assignTechnician(b._id, v)}
                >
                  <SelectTrigger className="w-[150px]" data-testid={`select-technician-${b._id}`}>
                    <SelectValue placeholder="Assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t._id} value={t.userId._id}>
                        {t.userId.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <Select value={b.status} onValueChange={(v) => updateStatus(b._id, v as BookingStatus)}>
                    <SelectTrigger className="w-[150px]" data-testid={`select-status-${b._id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {bookings.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-text-muted py-8">
              No bookings yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function CustomersTab() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<LocalUser[]>([]);
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const data = await apiFetch<LocalUser[]>("/admin/customers", { token });
      setCustomers(data);
    })();
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((c) => (
          <TableRow key={c._id} data-testid={`row-customer-${c._id}`}>
            <TableCell>{c.name}</TableCell>
            <TableCell>{c.email}</TableCell>
            <TableCell>{c.phone ?? "—"}</TableCell>
          </TableRow>
        ))}
        {customers.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-text-muted py-8">No customers yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function TechniciansTab({ technicians }: { technicians: TechnicianRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Specialties</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((t) => (
          <TableRow key={t._id} data-testid={`row-technician-${t._id}`}>
            <TableCell>{t.userId.name}</TableCell>
            <TableCell>{t.userId.email}</TableCell>
            <TableCell>{t.rating.toFixed(1)} ★</TableCell>
            <TableCell>{t.specialties?.join(", ") || "—"}</TableCell>
          </TableRow>
        ))}
        {technicians.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-text-muted py-8">No technicians yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function ReviewsTab() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const data = await apiFetch<Review[]>("/admin/reviews", { token });
      setReviews(data);
    })();
  }, []);
  return (
    <div className="space-y-3 p-2">
      {reviews.map((r) => {
        const customer = typeof r.customerId === "object" ? r.customerId : undefined;
        const service = typeof r.serviceId === "object" ? r.serviceId : undefined;
        return (
          <div key={r._id} className="rounded-lg border border-border p-4" data-testid={`review-${r._id}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{customer?.name ?? "Anonymous"}</p>
              <StarRating value={r.rating} readOnly size="sm" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">{service?.name}</p>
            <p className="text-sm mt-2">{r.comment}</p>
          </div>
        );
      })}
      {reviews.length === 0 && <p className="text-center text-text-muted py-8">No reviews yet.</p>}
    </div>
  );
}

export default function DashboardAdmin() {
  const { getToken } = useAuth();
  const { user, loading: userLoading } = useUserContext();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianRecord[]>([]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const [a, t] = await Promise.all([
        apiFetch<AdminAnalytics>("/admin/analytics", { token }),
        apiFetch<TechnicianRecord[]>("/admin/technicians", { token }),
      ]);
      setAnalytics(a);
      setTechnicians(t);
    })();
  }, []);

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
        {analytics && <AnalyticsCards analytics={analytics} />}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <h3>Admin Overview</h3>
            <p className="mt-1 text-sm text-text-muted">Manage bookings, customers, technicians, and reviews.</p>
          </div>
          <Tabs defaultValue="bookings" className="p-4">
            <TabsList>
              <TabsTrigger value="bookings" data-testid="tab-admin-bookings">Bookings</TabsTrigger>
              <TabsTrigger value="customers" data-testid="tab-admin-customers">Customers</TabsTrigger>
              <TabsTrigger value="technicians" data-testid="tab-admin-technicians">Technicians</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-admin-reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="bookings"><BookingsTab technicians={technicians} /></TabsContent>
            <TabsContent value="customers"><CustomersTab /></TabsContent>
            <TabsContent value="technicians"><TechniciansTab technicians={technicians} /></TabsContent>
            <TabsContent value="reviews"><ReviewsTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
