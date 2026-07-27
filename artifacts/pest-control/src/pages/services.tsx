import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServiceCardImage from "@/components/service-card-image";

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80')" 
        }}
      />
      {/* Themed Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-background/92 backdrop-blur-[1.5px] pointer-events-none" />

      {/* Page Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
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
              className="group card-interactive block rounded-xl border border-border bg-card/90 overflow-hidden shadow-sm backdrop-blur-xs"
              data-testid={`link-service-${s.slug}`}
            >
              <ServiceCardImage slug={s.slug} alt={s.name} />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-primary font-bold">{s.name}</h3>
                  {typeof s.basePrice === "number" && (
                    <span className="shrink-0 text-sm font-semibold text-accent-foreground bg-accent/25 px-2.5 py-1 rounded-full">
                      ₹{s.basePrice}+
                    </span>
                  )}
                </div>
                {s.description && <p className="text-sm mt-2 text-text-muted">{s.description}</p>}
              </div>
            </Link>
          ))}
          {services.length === 0 && !error && (
            <p className="text-text-muted">No services available yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
