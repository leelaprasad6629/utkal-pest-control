import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<ServiceItem>(`/services/${params.slug}`)
      .then(setService)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
        <h1>Service not found</h1>
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

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <div className="max-w-2xl rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-primary">{service.name}</h1>
        <p className="mt-3 text-text-muted">{service.description}</p>
        {typeof service.basePrice === "number" && (
          <p className="mt-4 inline-block text-sm font-semibold text-accent-foreground bg-accent/25 px-3 py-1.5 rounded-full">
            Starting at ₹{service.basePrice}
          </p>
        )}
        <div className="mt-6">
          <Link href="/quote">
            <Button size="lg" data-testid="button-book-now">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
