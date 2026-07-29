import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, Award, Leaf } from "lucide-react";

const SERVICE_FEATURES = [
  "Certified, background-verified technicians",
  "Eco-friendly, WHO-approved formulations",
  "Free inspection and assessment",
  "Warranty-backed treatment",
];

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  const staticMatch = STATIC_SERVICES.find((s) => s.slug === params.slug) ?? null;
  const [service, setService] = useState<ServiceItem | null>(staticMatch);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<ServiceItem>(`/services/${params.slug}`)
      .then((data) => setService(data))
      .catch(() => { if (!staticMatch) setNotFound(true); });
  }, [params.slug]);

  if (notFound) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-20 animate-fade-in text-center">
        <h1 className="text-2xl font-bold text-foreground">Service not found</h1>
        <p className="mt-2 text-muted-foreground">
          The service you're looking for doesn't exist.{" "}
          <Link href="/services" className="text-primary underline underline-offset-4">Browse all services</Link>.
        </p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const heroImage = `/images/services/${service.slug}.jpg`;

  return (
    <>
      <PageHero
        backgroundImage={heroImage}
        overlayOpacity={60}
        badge={service.category}
        title={service.name}
        subtitle={service.description}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 sm:py-16 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">What's Included</h2>
              <ul className="space-y-3">
                {SERVICE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Our Process</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Inspection", desc: "Free property assessment by certified technicians." },
                  { step: "2", title: "Treatment", desc: "Eco-friendly, targeted pest control application." },
                  { step: "3", title: "Follow-up", desc: "Warranty-backed monitoring and re-treatment if needed." },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl bg-muted/40 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {s.step}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
              {typeof service.basePrice === "number" && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-medium">Starting at</p>
                  <p className="text-3xl font-bold text-primary">₹{service.basePrice}</p>
                </div>
              )}
              <div className="space-y-2.5 mb-6 pb-6 border-b border-border">
                {[
                  { icon: ShieldCheck, text: "Satisfaction guarantee" },
                  { icon: Leaf, text: "Eco-friendly treatment" },
                  { icon: Award, text: "Certified technicians" },
                  { icon: Clock, text: "Same-day service available" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/quote">
                <Button size="lg" className="w-full h-12 text-sm font-semibold rounded-lg" data-testid="button-book-now">
                  Book Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services" className="block mt-3">
                <Button variant="outline" className="w-full h-11 text-sm font-medium rounded-lg">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
