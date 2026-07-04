import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";
import StatusBadge from "@/components/status-badge";

export default function DashboardTechnician() {
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
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-6 border-b border-border">
        <h3>Technician Dashboard</h3>
        <p className="mt-1 text-sm text-text-muted">Your assigned jobs.</p>
      </div>

      {loading && <p className="p-6 text-text-muted">Loading jobs...</p>}
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
              <TableHead>Address</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const customer = typeof b.customerId === "object" ? b.customerId : undefined;
              return (
                <TableRow key={b._id} data-testid={`row-job-${b._id}`}>
                  <TableCell>{customer?.name ?? "—"}</TableCell>
                  <TableCell>{b.address?.line1 ?? "—"}</TableCell>
                  <TableCell>
                    {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              );
            })}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-text-muted py-8">
                  No jobs assigned yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
