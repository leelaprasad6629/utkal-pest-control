import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServiceCardImage from "@/components/service-card-image";
import PageHero from "@/components/page-hero";
import { PAGE_HERO_IMAGES } from "@/config/hero-images";

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <PageHero
        image={PAGE_HERO_IMAGES.services}
        size="md"
        title="Services"
        subtitle="Browse our pest control offerings and pick the right fit for your home or business."
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
        {error && (
          <p className="text-danger" data-testid="text-error">
            {error}
          </p>
        )}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <Link
              key={s._id}
              href={`/services/${s.slug}`}
              className="group card-interactive block rounded-xl border border-border bg-card overflow-hidden shadow-sm"
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
