import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold">Services</h2>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-4 grid grid-cols-1 gap-3">
        {services.map((s) => (
          <Link
            key={s._id}
            href={`/services/${s.slug}`}
            className="p-4 border rounded hover:bg-gray-50"
            data-testid={`link-service-${s.slug}`}
          >
            <div className="font-semibold">{s.name}</div>
            {s.description && <div className="text-sm text-gray-600 mt-1">{s.description}</div>}
          </Link>
        ))}
        {services.length === 0 && !error && (
          <p className="text-gray-500">No services available yet.</p>
        )}
      </div>
    </main>
  );
}
