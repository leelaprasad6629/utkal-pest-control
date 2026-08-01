import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";
import { apiFetch } from "@/lib/api";
import type { PublicStats, Review, ServiceItem } from "@/lib/types";
import StarRating from "@/components/star-rating";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURED_SERVICES = [
  { slug: "residential-pest-control", name: "Residential Pest Control", description: "Safe, thorough protection for your home." },
  { slug: "commercial-pest-control", name: "Commercial Pest Control", description: "Discreet, compliant pest management for businesses." },
  { slug: "termite-control", name: "Termite Control", description: "Detection and treatment before structural damage spreads." },
  { slug: "rodent-control", name: "Rodent Control", description: "Humane, effective rodent exclusion and control." },
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

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    apiFetch<Review[]>("/reviews").then((data) => setReviews(data.slice(0, 6))).catch(() => setReviews([]));
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(() => setServices([]));
    apiFetch<PublicStats>("/stats").then(setStats).catch(() => setStats(null));
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, services]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const avgRating = stats?.averageRating ?? (reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null);
  const totalReviewsCount = stats?.reviewCount ?? reviews.length;

  const displayServices = services.length ? services : FEATURED_SERVICES;

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[hsl(155,43%,12%)] text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 md:py-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">{TAGLINE}</p>
          <h1 className="mt-2 max-w-2xl text-2xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-primary-foreground leading-tight">
            Protect your home, calmly and thoroughly.
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-primary-foreground/80 leading-relaxed">
            {BUSINESS_NAME} provides certified, eco-conscious pest control for homes and
            businesses in {SERVICE_AREAS.join(", ")}. Request a free quote and get a
            technician scheduled in minutes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/quote" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-11 text-sm sm:text-base font-semibold bg-accent text-accent-foreground border-accent hover:brightness-95 shadow-sm"
                data-testid="button-home-quote"
              >
                Get Free Quote
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-11 text-sm sm:text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-1">
            <p className="text-xl sm:text-2xl font-display font-semibold text-primary">
              {stats ? stats.totalCustomers.toLocaleString() : "—"}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">Customers served</p>
          </div>
          <div className="p-1">
            <p className="text-xl sm:text-2xl font-display font-semibold text-primary">15+</p>
            <p className="mt-0.5 text-xs text-text-muted">Years experience</p>
          </div>
          <div className="p-1">
            <p className="text-xl sm:text-2xl font-display font-semibold text-primary">
              {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : "—"}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">Average rating</p>
          </div>
          <div className="p-1">
            <p className="text-xl sm:text-2xl font-display font-semibold text-primary">24/7</p>
            <p className="mt-0.5 text-xs text-text-muted">Emergency response</p>
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Our Services</h2>
            <p className="mt-1 text-xs sm:text-sm text-text-muted max-w-xl">
              Every service is backed by certified technicians and a satisfaction guarantee.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shadow-2xs hover:bg-muted"
              onClick={scrollPrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full shadow-2xs hover:bg-muted"
              onClick={scrollNext}
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex -ml-4">
            {displayServices.map((s) => (
              <div
                key={s.slug}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 pl-4"
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="card-interactive flex flex-col justify-between h-full rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-primary/40 transition-all space-y-3"
                  data-testid={`link-service-${s.slug}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Bug className="w-4 h-4" />
                      </span>
                      {typeof s.basePrice === "number" && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ₹{s.basePrice}+
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{s.name}</h3>
                    {s.description && (
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-text-muted">
                      Certified Service
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-primary px-2">
                      View Details →
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots & View All */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/25 hover:bg-primary/50"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <Link href="/services">
            <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-semibold" data-testid="button-all-services">
              View All Services
            </Button>
          </Link>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-secondary/30 border-y border-border" data-testid="section-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Testimonials</h2>
              <p className="mt-2 text-text-muted max-w-xl text-sm sm:text-base">
                Real feedback from homeowners and businesses we've served.
              </p>
            </div>
            {avgRating !== null && totalReviewsCount > 0 && (
              <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-xl shadow-2xs self-start sm:self-auto" data-testid="rating-summary">
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
                    className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between"
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
            <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center" data-testid="no-reviews-message">
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
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why Choose Us</h2>
          <p className="mt-2 text-text-muted max-w-xl text-sm sm:text-base">
            We're committed to delivering safe, effective, and transparent pest control — every time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
            {WHY_CHOOSE_US.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 shadow-2xs"
                data-testid={`why-choose-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-foreground text-base">{item.title}</h4>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How It Works</h2>
        <p className="mt-2 text-text-muted max-w-xl text-sm sm:text-base">From booking to warranty, we make pest control simple.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={step.title} className="relative bg-card border border-border rounded-xl p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mb-3">
                {idx + 1}
              </div>
              <h4 className="font-semibold text-foreground text-base">{step.title}</h4>
              <p className="mt-1 text-sm text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-8 space-y-2">
          {FAQS.map((faq, idx) => (
            <AccordionItem key={faq.question} value={`faq-${idx}`} className="border rounded-xl px-4 bg-card">
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground">Serving {SERVICE_AREAS.join(", ")}</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm sm:text-base">
            Ready to get started? Book a free inspection and quote today.
          </p>
          <div className="pt-2">
            <Link href="/quote" className="inline-block w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-accent text-accent-foreground border-accent hover:brightness-95 shadow-sm"
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
