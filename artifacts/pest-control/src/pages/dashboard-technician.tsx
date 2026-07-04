import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";

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
    <div>
      <h3 className="text-lg font-semibold">Technician Dashboard</h3>
      <p className="mt-1 text-sm text-gray-600">Your assigned jobs.</p>

      {loading && <p className="mt-4 text-gray-500">Loading jobs...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && !error && (
        <Table className="mt-4">
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
                  <TableCell>{b.status}</TableCell>
                </TableRow>
              );
            })}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
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
