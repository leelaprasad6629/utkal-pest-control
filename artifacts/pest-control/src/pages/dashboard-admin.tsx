import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "wouter";
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
  DialogFooter,
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
  TechnicianRecord,
} from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import StarRating from "@/components/star-rating";
import { useUserContext } from "@/lib/user-context";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "technician-assigned",
  "en-route",
  "in-progress",
  "completed",
  "cancelled",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  experience: "",
  city: "",
  profileImage: "",
  specialties: "",
};

function AnalyticsCards({ analytics }: { analytics: AdminAnalytics }) {
  const pending = analytics.bookingsByStatus["pending"] ?? 0;
  const completed = analytics.bookingsByStatus["completed"] ?? 0;
  const cancelled = analytics.bookingsByStatus["cancelled"] ?? 0;
  const cards = [
    { label: "Total Bookings", value: analytics.totalBookings },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
    { label: "Cancelled", value: cancelled },
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString()}` },
    { label: "Customers", value: analytics.totalCustomers },
    { label: "Technicians", value: analytics.totalTechnicians },
    {
      label: "Avg. Rating",
      value: analytics.averageRating ? `${analytics.averageRating.toFixed(1)} ★ (${analytics.reviewCount})` : "—",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

  useEffect(() => { loadBookings(); }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    });
    loadBookings();
  }

  async function assignTechnician(id: string, userId: string) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "technician-assigned", technicianId: userId }),
      token,
    });
    loadBookings();
  }

  if (loading) return <p className="p-6 text-text-muted">Loading bookings...</p>;
  if (error) return <p className="p-6 text-danger" data-testid="text-error">{error}</p>;

  // Only technicians with a linked User can be assigned to bookings
  const assignable = technicians.filter((t) => t.userId && t.status === "active");

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
                    {assignable.map((t) => (
                      <SelectItem key={t._id} value={t.userId!._id}>
                        {t.name}
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
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
            <TableCell colSpan={6} className="text-center text-text-muted py-8">No bookings yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function CustomersTab() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<LocalUser[]>("/admin/customers", { token });
        setCustomers(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6 text-text-muted">Loading customers...</p>;

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

  function openAdd() {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  }

  function openEdit(t: TechnicianRecord) {
    setForm({
      name: t.name,
      email: t.email,
      phone: t.phone ?? "",
      specialization: t.specialization ?? "",
      experience: t.experience !== undefined ? String(t.experience) : "",
      city: t.city ?? "",
      profileImage: t.profileImage ?? "",
      specialties: t.specialties?.join(", ") ?? "",
    });
    setEditTarget(t);
  }

  function closeDialogs() {
    setAddOpen(false);
    setEditTarget(null);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        city: form.city.trim() || undefined,
        profileImage: form.profileImage.trim() || undefined,
        specialties: form.specialties
          ? form.specialties.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      if (editTarget) {
        await apiFetch(`/admin/technicians/${editTarget._id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
          token,
        });
        toast({ title: "Technician updated" });
      } else {
        await apiFetch("/admin/technicians", {
          method: "POST",
          body: JSON.stringify(body),
          token,
        });
        toast({ title: "Technician added" });
      }
      closeDialogs();
      onRefresh();
    } catch (err) {
      toast({
        title: editTarget ? "Update failed" : "Add failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
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
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
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
      toast({
        title: "Status update failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
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
        <Button size="sm" onClick={openAdd} data-testid="button-add-technician">
          + Add Technician
        </Button>
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
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(t)}
                    data-testid={`button-edit-technician-${t._id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(t)}
                    data-testid={`button-toggle-technician-${t._id}`}
                  >
                    {t.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(t)}
                    data-testid={`button-delete-technician-${t._id}`}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {technicians.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-text-muted py-8">
                No technicians yet. Click &quot;Add Technician&quot; to get started.
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
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-confirm-add-technician">
              {saving ? "Saving..." : "Add Technician"}
            </Button>
          </DialogFooter>
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
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-confirm-edit-technician">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
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

function ReviewsTab() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<Review[]>("/admin/reviews", { token });
        setReviews(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6 text-text-muted">Loading reviews...</p>;

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

  async function loadData() {
    const token = await getToken();
    const [a, t] = await Promise.all([
      apiFetch<AdminAnalytics>("/admin/analytics", { token }),
      apiFetch<TechnicianRecord[]>("/admin/technicians", { token }),
    ]);
    setAnalytics(a);
    setTechnicians(t);
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
            <TabsContent value="bookings">
              <BookingsTab technicians={technicians} />
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
