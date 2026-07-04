import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiFetch } from "@/lib/api";
import type { LocalUser } from "@/lib/types";
import DashboardAdmin from "./dashboard-admin";
import DashboardTechnician from "./dashboard-technician";

export default function Dashboard() {
  const { getToken } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<LocalUser>("/me", { token });
        setUser(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen p-4 max-w-5xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </header>
      <div>
        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && user?.role === "admin" && <DashboardAdmin />}
        {!loading && user?.role === "technician" && <DashboardTechnician />}
        {!loading && (!user || user.role === "customer") && (
          <div>
            <h3 className="text-lg font-semibold">My Bookings</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your bookings and their status will appear here once you request a quote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
