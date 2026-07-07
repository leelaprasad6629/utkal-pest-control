import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";
import { apiFetch } from "@/lib/api";
import type { PublicStats, Review, ServiceItem } from "@/lib/types";
import StarRating from "@/components/star-rating";

const FEATURED_SERVICES = [
  { slug: "residential-pest-control", name: "Residential", description: "Safe, thorough protection for your home." },
  { slug: "commercial-pest-control", name: "Commercial", description: "Discreet, compliant pest management for businesses." },
  { slug: "termite-control", name: "Termite", description: "Detection and treatment before damage spreads." },
  { slug: "rodent-control", name: "Rodent", description: "Humane, effective rodent exclusion and control." },
];

const PROCESS_STEPS = [
  { title: "Book Online", description: "Request a quote in minutes — pick your service, date, and time." },
  { title: "Free Inspection", description: "Our certified technician inspects your property and confirms the plan." },
  { title: "Safe Treatment", description: "Eco-conscious, government-approved treatment applied by trained staff." },
  { title: "Follow-up & Warranty", description: "We check in after treatment and stand behind our work with a warranty." },
];

const WHY_CHOOSE_US = [
  {
    icon: "🌿",
    title: "Eco-Friendly Products",
    description: "We use government-approved, low-toxicity formulations that are safe for children and pets.",
  },
  {
    icon: "🎓",
    title: "Certified Technicians",
    description: "Every technician is trained, certified, and background-verified before joining our team.",
  },
  {
    icon: "🛡️",
    title: "Service Warranty",
    description: "Most treatments come with a warranty. If pests return, so do we — at no extra charge.",
  },
  {
    icon: "⚡",
    title: "24/7 Emergency Response",
    description: "Urgent infestation? We offer same-day emergency visits across all service areas.",
  },
  {
    icon: "💰",
    title: "Transparent Pricing",
    description: "No hidden fees. All pricing is shared upfront during the free inspection.",
  },
  {
    icon: "📱",
    title: "Easy Online Booking",
    description: "Book, track, and manage your services entirely online — no phone calls required.",
  },
];

const FAQS = [
  {
    question: "Are your treatments safe for children and pets?",
    answer: "Yes. We use low-toxicity, government-approved formulations and always share post-treatment safety guidance.",
  },
  {
    question: "How quickly can you schedule a visit?",
    answer: "Most bookings are confirmed within 24 hours, and we offer emergency same-day visits for urgent infestations.",
  },
  {
    question: "Do you offer a warranty on your services?",
    answer: "Most residential and termite services include a warranty period — details are shown on each service page.",
  },
  {
    question: "How do I pay for a service?",
    answer: "You can pay securely online after your service is completed, or arrange payment with our team directly.",
  },
];

function Stars({ value }: { value: number }) {
  return <StarRating value={value} readOnly size="sm" />;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    apiFetch<Review[]>("/reviews").then((data) => setReviews(data.slice(0, 3))).catch(() => setReviews([]));
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(() => setServices([]));
    apiFetch<PublicStats>("/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[hsl(155,43%,12%)] text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">{TAGLINE}</p>
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

      {/* Stats bar */}
      <section className="border-b border-border bg-secondary/40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-display font-semibold text-primary">
              {stats ? stats.totalCustomers.toLocaleString() : "—"}
            </p>
            <p className="mt-1 text-xs md:text-sm text-text-muted">Customers served</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-semibold text-primary">15+</p>
            <p className="mt-1 text-xs md:text-sm text-text-muted">Years of experience</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-semibold text-primary">
              {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : "—"}
            </p>
            <p className="mt-1 text-xs md:text-sm text-text-muted">Average customer rating</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-semibold text-primary">24/7</p>
            <p className="mt-1 text-xs md:text-sm text-text-muted">Emergency response</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <h2>Our Services</h2>
        <p className="mt-2 text-text-muted max-w-xl">
          Every service is backed by certified technicians and a satisfaction guarantee.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {(services.length ? services.slice(0, 4) : FEATURED_SERVICES).map((s) => (
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
        <div className="mt-6 text-center">
          <Link href="/services">
            <Button variant="outline" data-testid="button-all-services">View All Services</Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-14">
          <h2>Why Choose Us</h2>
          <p className="mt-2 text-text-muted max-w-xl">
            We're committed to delivering safe, effective, and transparent pest control — every time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {WHY_CHOOSE_US.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
                data-testid={`why-choose-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <h2>How It Works</h2>
        <p className="mt-2 text-text-muted max-w-xl">From booking to warranty, we make pest control simple.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={step.title} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {idx + 1}
              </div>
              <h4 className="mt-3 text-foreground">{step.title}</h4>
              <p className="mt-1 text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-14">
          <h2>What Our Customers Say</h2>
          <p className="mt-2 text-text-muted max-w-xl">Real feedback from homeowners and businesses we've served.</p>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {reviews.map((r) => {
                const customer = typeof r.customerId === "object" ? r.customerId : undefined;
                return (
                  <div
                    key={r._id}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                    data-testid={`testimonial-${r._id}`}
                  >
                    <Stars value={r.rating} />
                    <p className="mt-3 text-sm text-foreground/90 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                    <p className="mt-3 text-sm font-medium text-text-muted">— {customer?.name ?? "Verified Customer"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-text-muted">Be the first to share your experience!</p>
              <Link href="/quote" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Book a Service</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-14">
        <h2>Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQS.map((faq, idx) => (
            <AccordionItem key={faq.question} value={`faq-${idx}`}>
              <AccordionTrigger data-testid={`faq-trigger-${idx}`}>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-14 text-center">
          <h2 className="text-primary-foreground">Serving {SERVICE_AREAS.join(", ")}</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Ready to get started? Book a free inspection and quote today.
          </p>
          <div className="mt-6">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground border-accent hover:brightness-95"
                data-testid="button-cta-quote"
              >
                Get Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
