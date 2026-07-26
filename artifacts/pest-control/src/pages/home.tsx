import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";
import { apiFetch } from "@/lib/api";
import type { PublicStats, Review, ServiceItem } from "@/lib/types";
import StarRating from "@/components/star-rating";
import ServiceCardImage from "@/components/service-card-image";
import { motion } from "framer-motion";
import { Award, UserCheck, Leaf, Zap, Tag, Globe, Headphones, ThumbsUp, ShieldCheck, ArrowRight, Sparkles, Home as HomeIcon, Building2, Sprout, Shield } from "lucide-react";

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
    icon: Award,
    title: "15+ Years of Experience",
    description: "Trusted by thousands of homeowners and businesses with over a decade of proven pest control excellence.",
  },
  {
    icon: UserCheck,
    title: "Certified & Trained Professionals",
    description: "Every technician is background-verified, certified, and regularly trained on the latest industry standards.",
  },
  {
    icon: Leaf,
    title: "Safe & Eco-Friendly Treatments",
    description: "We use WHO-approved, low-toxicity formulations that are safe for your family, pets, and the environment.",
  },
  {
    icon: Zap,
    title: "Same-Day Service",
    description: "Urgent infestation? We offer fast response times to inspect and treat active pest problems immediately.",
  },
  {
    icon: Tag,
    title: "Affordable Pricing",
    description: "Transparent upfront quotes with zero hidden charges, ensuring the best value for your budget.",
  },
  {
    icon: Globe,
    title: "PAN India Service",
    description: "Extensive networks and operations serving major cities and surrounding local suburbs nationwide.",
  },
  {
    icon: Headphones,
    title: "24×7 Customer Support",
    description: "Round-the-clock dedicated helpdesk to assist you with booking requests and support queries.",
  },
  {
    icon: ThumbsUp,
    title: "Customer Satisfaction Guarantee",
    description: "If pests return during the warranty period, we treat your property again at no extra charge.",
  },
];

const HERO_IMAGE_PALETTE = [
  {
    title: "Residential protection",
    description: "Trusted home treatments with careful inspection and eco-safe products.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    icon: HomeIcon,
  },
  {
    title: "Commercial pest control",
    description: "Discreet service plans for offices, retail spaces, and facilities.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    icon: Building2,
  },
  {
    title: "Eco-friendly spraying",
    description: "Low-impact applications that protect families, pets, and the environment.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
    icon: Sprout,
  },
  {
    title: "Certified technicians",
    description: "Skilled professionals bring precision treatment and dependable follow-through.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    icon: Shield,
  },
] as const;

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
    apiFetch<Review[]>("/reviews").then((data) => setReviews(data.slice(0, 6))).catch(() => setReviews([]));
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(() => setServices([]));
    apiFetch<PublicStats>("/stats").then(setStats).catch(() => setStats(null));
  }, []);

  const avgRating = stats?.averageRating ?? (reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null);
  const totalReviewsCount = stats?.reviewCount ?? reviews.length;

  return (
    <div className="relative min-h-screen w-full">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80')" 
        }}
      />
      {/* Themed Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-background/92 backdrop-blur-[1.5px] pointer-events-none" />

      {/* Page Content */}
      <main className="relative z-10 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-[hsl(155,43%,18%)] to-[hsl(155,43%,12%)] text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
            alt="Pest control technician treating a home"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {TAGLINE}
            </div>
            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
              Protect your home, calmly and thoroughly.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {BUSINESS_NAME} provides certified, eco-conscious pest control for homes and
              businesses in {SERVICE_AREAS.join(", ")}. Request a free quote and get a
              technician scheduled in minutes.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/quote" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full bg-accent text-accent-foreground border-accent text-base font-semibold shadow-[0_16px_40px_-20px_rgba(212,163,115,0.8)] hover:brightness-95 sm:w-auto"
                  data-testid="button-home-quote"
                >
                  Get Free Quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-primary-foreground/25 bg-primary-foreground/10 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/15 sm:w-auto"
                  data-testid="button-home-services"
                >
                  View Services
                </Button>
              </Link>
            </div>
          </div>

          <div className="section-shell w-full max-w-xl border-primary-foreground/10 bg-card/80 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Trusted by local families</p>
                <p className="text-sm text-text-muted">Certified inspections, safe treatments, and a workmanship guarantee.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                <p className="text-2xl font-semibold text-primary">24/7</p>
                <p className="mt-1 text-sm text-text-muted">Rapid response for urgent infestations</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                <p className="text-2xl font-semibold text-primary">100%</p>
                <p className="mt-1 text-sm text-text-muted">Transparent quotes with no hidden surprises</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="soft-divider border-b border-border/70 bg-secondary/30 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 sm:gap-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="rounded-2xl border border-border/80 bg-card/80 p-3 text-center shadow-sm">
            <p className="text-2xl font-display font-semibold text-primary sm:text-3xl">
              {stats ? stats.totalCustomers.toLocaleString() : "—"}
            </p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">Customers served</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/80 p-3 text-center shadow-sm">
            <p className="text-2xl font-display font-semibold text-primary sm:text-3xl">15+</p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">Years experience</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/80 p-3 text-center shadow-sm">
            <p className="text-2xl font-display font-semibold text-primary sm:text-3xl">
              {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : "—"}
            </p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">Average rating</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/80 p-3 text-center shadow-sm">
            <p className="text-2xl font-display font-semibold text-primary sm:text-3xl">24/7</p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">Emergency response</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-4">
          {HERO_IMAGE_PALETTE.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/10 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-4 w-4" />
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Our Services</h2>
            <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
              Every service is backed by certified technicians and a satisfaction guarantee.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            Trusted, thorough, and discreet service
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {(services.length ? services.slice(0, 4) : FEATURED_SERVICES).map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group card-interactive block overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm"
              data-testid={`link-service-${s.slug}`}
            >
              <ServiceCardImage slug={s.slug} alt={s.name} />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-primary">{s.name}</h3>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services">
            <Button variant="outline" className="h-11 px-6 font-semibold" data-testid="button-all-services">
              View All Services
            </Button>
          </Link>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="border-y border-border/70 bg-secondary/25 backdrop-blur-sm" data-testid="section-testimonials">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Testimonials</h2>
              <p className="mt-2 text-text-muted max-w-xl text-sm sm:text-base">
                Real feedback from homeowners and businesses we've served.
              </p>
            </div>
            {avgRating !== null && totalReviewsCount > 0 && (
              <div className="flex items-center gap-3 self-start rounded-2xl border border-border/80 bg-card/90 px-4 py-2.5 shadow-sm sm:self-auto" data-testid="rating-summary">
                <Stars value={Math.round(avgRating)} />
                <div className="text-sm">
                  <span className="font-bold text-foreground" data-testid="text-overall-rating">{avgRating.toFixed(1)}/5</span>
                  <span className="text-text-muted ml-1 font-medium" data-testid="text-reviews-count">({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})</span>
                </div>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
              {reviews.map((r) => {
                const customer = typeof r.customerId === "object" ? r.customerId : undefined;
                const service = typeof r.serviceId === "object" ? r.serviceId : undefined;
                const dateStr = r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={r._id}
                    className="flex flex-col justify-between rounded-[1.15rem] border border-border/80 bg-card p-5 shadow-sm"
                    data-testid={`testimonial-${r._id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Stars value={r.rating} />
                        {dateStr && <span className="text-xs text-text-muted">{dateStr}</span>}
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">— {customer?.name ?? "Verified Customer"}</span>
                      {service?.name && <span className="text-text-muted font-medium">{service.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.25rem] border border-border/80 bg-card p-8 text-center shadow-sm" data-testid="no-reviews-message">
              <p className="text-foreground font-semibold text-base">No reviews yet</p>
              <p className="mt-1 text-text-muted text-sm max-w-md mx-auto">
                Be the first to share your experience after booking a service with us!
              </p>
              <Link href="/quote" className="mt-4 inline-block">
                <Button variant="outline" size="sm" data-testid="button-book-service">
                  Book a Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="overflow-hidden border-y border-border/70 bg-secondary/25 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Choose Utkal Pest Control?</h2>
            <p className="mt-4 text-text-muted text-base sm:text-lg">
              With over 15 years of industry leadership, we deliver the most reliable, safe, and professional pest control services for residential and commercial spaces across the country.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {WHY_CHOOSE_US.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex gap-4 rounded-[1.2rem] border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                  data-testid={`why-choose-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-float-slow">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base sm:text-lg">{item.title}</h4>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">How It Works</h2>
        <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">From booking to warranty, we make pest control simple.</p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={step.title} className="relative rounded-[1.2rem] border border-border/80 bg-card p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {idx + 1}
              </div>
              <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-8 space-y-2">
          {FAQS.map((faq, idx) => (
            <AccordionItem key={faq.question} value={`faq-${idx}`} className="rounded-2xl border border-border/80 bg-card px-4 shadow-sm">
              <AccordionTrigger data-testid={`faq-trigger-${idx}`} className="text-base font-semibold py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[1.75rem] border border-primary-foreground/15 bg-primary/95 p-8 shadow-soft sm:p-10">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl">Serving {SERVICE_AREAS.join(", ")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Ready to get started? Book a free inspection and quote today.
            </p>
            <div className="pt-6">
              <Link href="/quote" className="inline-block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full bg-accent px-8 text-base font-semibold text-accent-foreground border-accent shadow-[0_16px_40px_-20px_rgba(212,163,115,0.8)] hover:brightness-95 sm:w-auto"
                  data-testid="button-cta-quote"
                >
                  Get Free Quote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
