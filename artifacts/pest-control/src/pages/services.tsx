import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServiceCardImage from "@/components/service-card-image";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";

export default function Services() {
  // Render static data instantly — no loading spinner, no blank state.
  const [services, setServices] = useState<ServiceItem[]>(STATIC_SERVICES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch from the API in the background; if it succeeds, replace static
    // data with live DB records. If it fails, keep the static list.
    apiFetch<ServiceItem[]>("/services")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHero
        backgroundImage="/images/heroes/contact-hero.jpg"
        overlayOpacity={55}
        title="Our Services"
        subtitle="Browse our pest control offerings and pick the right fit for your home or business."
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
        {error && (
          <p className="mb-4 text-danger" data-testid="text-error">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {services.map((s) => (
            <Link
              key={s._id}
              href={`/services/${s.slug}`}
              className="group card-interactive block rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md"
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
        </div>
      </main>
    </>
  );
}
