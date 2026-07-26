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
import { Award, UserCheck, Leaf, Zap, Tag, Globe, Headphones, ThumbsUp } from "lucide-react";

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
      <section className="bg-gradient-to-br from-primary to-[hsl(155,43%,12%)] text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">{TAGLINE}</p>
          <h1 className="mt-3 max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-primary-foreground leading-tight">
            Protect your home, calmly and thoroughly.
          </h1>
          <p className="mt-4 max-w-xl text-base sm:text-lg text-primary-foreground/80 leading-relaxed">
            {BUSINESS_NAME} provides certified, eco-conscious pest control for homes and
            businesses in {SERVICE_AREAS.join(", ")}. Request a free quote and get a
            technician scheduled in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/quote" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 text-base font-semibold bg-accent text-accent-foreground border-accent hover:brightness-95 shadow-sm"
                data-testid="button-home-quote"
              >
                Get Free Quote
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-home-services"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-secondary/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-2">
            <p className="text-2xl sm:text-3xl font-display font-semibold text-primary">
              {stats ? stats.totalCustomers.toLocaleString() : "—"}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">Customers served</p>
          </div>
          <div className="p-2">
            <p className="text-2xl sm:text-3xl font-display font-semibold text-primary">15+</p>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">Years experience</p>
          </div>
          <div className="p-2">
            <p className="text-2xl sm:text-3xl font-display font-semibold text-primary">
              {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : "—"}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">Average rating</p>
          </div>
          <div className="p-2">
            <p className="text-2xl sm:text-3xl font-display font-semibold text-primary">24/7</p>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">Emergency response</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Services</h2>
        <p className="mt-2 text-text-muted max-w-xl text-sm sm:text-base">
          Every service is backed by certified technicians and a satisfaction guarantee.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {(services.length ? services.slice(0, 4) : FEATURED_SERVICES).map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group card-interactive block rounded-xl border border-border bg-card overflow-hidden shadow-2xs hover:border-primary/40 transition-all"
              data-testid={`link-service-${s.slug}`}
            >
              <ServiceCardImage slug={s.slug} alt={s.name} />
              <div className="p-5">
                <h3 className="text-primary font-bold text-lg">{s.name}</h3>
                <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{s.description}</p>
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
      <section className="bg-secondary/20 border-y border-border backdrop-blur-xs" data-testid="section-testimonials">
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
      <section className="bg-secondary/20 border-y border-border overflow-hidden backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Choose Utkal Pest Control?</h2>
            <p className="mt-4 text-text-muted text-base sm:text-lg">
              With over 15 years of industry leadership, we deliver the most reliable, safe, and professional pest control services for residential and commercial spaces across the country.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mt-16">
            {WHY_CHOOSE_US.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-200"
                  data-testid={`why-choose-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 animate-pulse-slow">
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
    </div>
  );
}
