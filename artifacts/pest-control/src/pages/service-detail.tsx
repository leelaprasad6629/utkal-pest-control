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
    return <div className="max-w-5xl mx-auto px-4 py-8">Service not found</div>;
  }

  if (!service) {
    return <div className="max-w-5xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{service.name}</h1>
      <p className="mt-2">{service.description}</p>
      {typeof service.basePrice === "number" && (
        <p className="mt-2 font-semibold">Starting at ₹{service.basePrice}</p>
      )}
      <div className="mt-4">
        <Link href="/quote">
          <Button data-testid="button-book-now">Book Now</Button>
        </Link>
      </div>
    </main>
  );
}
