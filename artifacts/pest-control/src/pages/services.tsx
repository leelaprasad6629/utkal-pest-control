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
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      <h1>Services</h1>
      <p className="mt-2 text-text-muted max-w-xl">
        Browse our pest control offerings and pick the right fit for your home or business.
      </p>
      {error && (
        <p className="mt-4 text-danger" data-testid="text-error">
          {error}
        </p>
      )}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => (
          <Link
            key={s._id}
            href={`/services/${s.slug}`}
            className="card-interactive block rounded-xl border border-border bg-card p-5 shadow-sm"
            data-testid={`link-service-${s.slug}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-primary">{s.name}</h3>
              {typeof s.basePrice === "number" && (
                <span className="shrink-0 text-sm font-semibold text-accent-foreground bg-accent/25 px-2.5 py-1 rounded-full">
                  ₹{s.basePrice}+
                </span>
              )}
            </div>
            {s.description && <p className="text-sm mt-2 text-text-muted">{s.description}</p>}
          </Link>
        ))}
        {services.length === 0 && !error && (
          <p className="text-text-muted">No services available yet.</p>
        )}
      </div>
    </main>
  );
}
