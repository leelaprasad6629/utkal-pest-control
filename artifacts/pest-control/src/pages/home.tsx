import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";

const FEATURED_SERVICES = [
  { slug: "residential-pest-control", name: "Residential" },
  { slug: "commercial-pest-control", name: "Commercial" },
  { slug: "termite-control", name: "Termite" },
  { slug: "rodent-control", name: "Rodent" },
];

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <section className="bg-primary text-primary-foreground p-8 rounded-lg">
        <h1 className="text-3xl font-bold">{BUSINESS_NAME}</h1>
        <p className="mt-2 text-sm opacity-90">{TAGLINE}</p>
        <h2 className="text-2xl font-semibold mt-6">Protect your home — Book a service</h2>
        <p className="mt-2">
          Get a free quote and quick booking. Mobile-first booking for customers in{" "}
          {SERVICE_AREAS.join(", ")}.
        </p>
        <div className="mt-4">
          <Link href="/quote">
            <Button variant="secondary" data-testid="button-home-quote">
              Get Free Quote
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold">Our Services</h3>
        <div className="grid grid-cols-2 gap-4 mt-3">
          {FEATURED_SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="p-4 border rounded hover:bg-gray-50"
              data-testid={`link-service-${s.slug}`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
