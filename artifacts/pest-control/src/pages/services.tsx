import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServiceCardImage from "@/components/service-card-image";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>(STATIC_SERVICES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHero
        backgroundImage="https://images.unsplash.com/photo-1591285643087-97c7a5b1d3e4?auto=format&fit=crop&w=1600&q=80"
        overlayOpacity={60}
        badge="Our Services"
        title="Our Services"
        subtitle="Browse our pest control offerings and pick the right fit for your home or business."
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 sm:py-16 animate-fade-in">
        {error && (
          <p className="mb-4 text-destructive text-sm" data-testid="text-error">{error}</p>
        )}

        <div className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          All services backed by certified technicians and satisfaction guarantee.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {services.map((s) => (
            <Link
              key={s._id}
              href={`/services/${s.slug}`}
              className="group block rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              data-testid={`link-service-${s.slug}`}
            >
              <ServiceCardImage slug={s.slug} alt={s.name} />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-primary">{s.name}</h3>
                  {typeof s.basePrice === "number" && (
                    <span className="shrink-0 text-xs font-semibold text-accent-foreground bg-accent/20 px-2.5 py-1 rounded-full">
                      ₹{s.basePrice}+
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{s.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
