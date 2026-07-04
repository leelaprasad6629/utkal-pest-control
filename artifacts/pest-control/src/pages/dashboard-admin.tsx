import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";
import StatusBadge from "@/components/status-badge";

const STATUS_OPTIONS: Booking["status"][] = [
  "pending",
  "confirmed",
  "en-route",
  "in-progress",
  "completed",
  "cancelled",
];

export default function DashboardAdmin() {
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

  async function updateStatus(id: string, status: Booking["status"]) {
    const token = await getToken();
    await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    });
    loadBookings();
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-6 border-b border-border">
        <h3>Admin Overview</h3>
        <p className="mt-1 text-sm text-text-muted">All bookings across the business.</p>
      </div>

      {loading && <p className="p-6 text-text-muted">Loading bookings...</p>}
      {error && (
        <p className="p-6 text-danger" data-testid="text-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const customer = typeof b.customerId === "object" ? b.customerId : undefined;
              const service = typeof b.serviceId === "object" ? b.serviceId : undefined;
              return (
                <TableRow key={b._id} data-testid={`row-booking-${b._id}`}>
                  <TableCell>{customer?.name ?? "—"}</TableCell>
                  <TableCell>{service?.name ?? "—"}</TableCell>
                  <TableCell>
                    {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <Select value={b.status} onValueChange={(v) => updateStatus(b._id, v as Booking["status"])}>
                        <SelectTrigger className="w-[140px]" data-testid={`select-status-${b._id}`}>
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
                <TableCell colSpan={4} className="text-center text-text-muted py-8">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
