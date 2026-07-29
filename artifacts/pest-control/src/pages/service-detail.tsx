import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  // Look up the service from static data first so the page renders instantly.
  const staticMatch = STATIC_SERVICES.find((s) => s.slug === params.slug) ?? null;
  const [service, setService] = useState<ServiceItem | null>(staticMatch);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try the API for richer data (features, FAQs, etc.); fall back to static.
    apiFetch<ServiceItem>(`/services/${params.slug}`)
      .then((data) => setService(data))
      .catch(() => {
        // If static data had a match, keep it; otherwise show not-found.
        if (!staticMatch) setNotFound(true);
      });
  }, [params.slug]);

  if (notFound) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Service not found</h1>
        <p className="mt-2 text-text-muted">
          The service you're looking for doesn't exist.{" "}
          <Link href="/services" className="text-primary underline underline-offset-4">
            Browse all services
          </Link>
          .
        </p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <p className="text-text-muted">Loading...</p>
      </main>
    );
  }

  const heroImage = `/images/services/${service.slug}.jpg`;

  return (
    <>
      <PageHero
        backgroundImage={heroImage}
        overlayOpacity={55}
        title={service.name}
        subtitle={service.description}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 sm:py-16 animate-fade-in">
        <div className="max-w-2xl rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {typeof service.basePrice === "number" && (
            <p className="mb-4 inline-block text-sm font-semibold text-accent-foreground bg-accent/25 px-3 py-1.5 rounded-full">
              Starting at ₹{service.basePrice}
            </p>
          )}
          <div>
            <Link href="/quote">
              <Button size="lg" data-testid="button-book-now">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
