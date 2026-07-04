import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";

const FEATURED_SERVICES = [
  { slug: "residential-pest-control", name: "Residential", description: "Safe, thorough protection for your home." },
  { slug: "commercial-pest-control", name: "Commercial", description: "Discreet, compliant pest management for businesses." },
  { slug: "termite-control", name: "Termite", description: "Detection and treatment before damage spreads." },
  { slug: "rodent-control", name: "Rodent", description: "Humane, effective rodent exclusion and control." },
];

export default function Home() {
  return (
    <main className="animate-fade-in">
      <section className="bg-gradient-to-br from-primary to-[hsl(155,43%,12%)] text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {TAGLINE}
          </p>
          <h1 className="mt-4 max-w-2xl text-primary-foreground">
            Protect your home, calmly and thoroughly.
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-primary-foreground/80">
            {BUSINESS_NAME} provides certified, eco-conscious pest control for homes and
            businesses in {SERVICE_AREAS.join(", ")}. Request a free quote and get a
            technician scheduled in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground border-accent hover:brightness-95"
                data-testid="button-home-quote"
              >
                Get Free Quote
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-home-services"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <h2>Our Services</h2>
        <p className="mt-2 text-text-muted max-w-xl">
          Every service is backed by certified technicians and a satisfaction guarantee.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {FEATURED_SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="card-interactive block rounded-xl border border-border bg-card p-5 shadow-sm"
              data-testid={`link-service-${s.slug}`}
            >
              <h3 className="text-primary">{s.name}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
