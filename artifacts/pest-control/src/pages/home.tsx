import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";
import { apiFetch } from "@/lib/api";
import type { PublicStats, Review, ServiceItem } from "@/lib/types";
import StarRating from "@/components/star-rating";
import ServiceCardImage from "@/components/service-card-image";
import PageHero from "@/components/page-hero";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import {
  Award,
  UserCheck,
  Leaf,
  Zap,
  Tag,
  Globe,
  Headphones,
  ThumbsUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Home as HomeIcon,
  Building2,
  Sprout,
  Shield,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Users
} from "lucide-react";

const FEATURED_SERVICES = [
  { slug: "residential-pest-control", name: "Residential", description: "Safe, thorough protection for your home.", basePrice: 999 },
  { slug: "commercial-pest-control", name: "Commercial", description: "Discreet, compliant pest management for businesses.", basePrice: 1999 },
  { slug: "termite-control", name: "Termite", description: "Detection and treatment before damage spreads.", basePrice: 1499 },
  { slug: "rodent-control", name: "Rodent", description: "Humane, effective rodent exclusion and control.", basePrice: 899 },
];

const PROCESS_STEPS = [
  {
    title: "Inspection",
    stepNum: "01",
    subtitle: "Free Assessment",
    description: "Our certified technicians conduct a comprehensive property inspection to pinpoint pest entries and risk areas.",
  },
  {
    title: "Treatment Plan",
    stepNum: "02",
    subtitle: "Customized Strategy",
    description: "We craft a target-specific treatment strategy utilizing WHO-approved, low-toxicity products tailored to your needs.",
  },
  {
    title: "Pest Control",
    stepNum: "03",
    subtitle: "Precision Service",
    description: "Our trained experts apply safe, eco-conscious treatments thoroughly and discreetly with minimal disruption.",
  },
  {
    title: "Follow-up & Warranty",
    stepNum: "04",
    subtitle: "100% Satisfaction",
    description: "Post-treatment checkups and complete satisfaction guarantee — if pests return during warranty, we re-treat for free.",
  },
];

const TRUST_BADGES = [
  { icon: Leaf, title: "Eco Friendly", desc: "Pet & Family Safe Formulations" },
  { icon: UserCheck, title: "Licensed Professionals", desc: "Background Checked & Verified" },
  { icon: Award, title: "Government Approved", desc: "CPCB & Central Standard Compliant" },
  { icon: Zap, title: "Emergency Service", desc: "Rapid Same-Day Response" },
  { icon: Headphones, title: "24×7 Support", desc: "Always Available Assistance" },
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
  const carouselRef = useRef<HTMLDivElement>(null);

  // ── Services carousel state ──
  const [servicesApi, setServicesApi] = useState<CarouselApi>();
  const [servicesCurrent, setServicesCurrent] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);

  useEffect(() => {
    apiFetch<Review[]>("/reviews").then((data) => setReviews(data.slice(0, 8))).catch(() => setReviews([]));
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(() => setServices([]));
    apiFetch<PublicStats>("/stats").then(setStats).catch(() => setStats(null));
  }, []);

  // ── Services carousel: autoplay + pagination dots ──
  useEffect(() => {
    if (!servicesApi) return;
    setServicesCount(servicesApi.scrollSnapList().length);
    const onSelect = () => setServicesCurrent(servicesApi.selectedScrollSnap());
    servicesApi.on("select", onSelect);
    servicesApi.on("reInit", onSelect);
    return () => {
      servicesApi.off("select", onSelect);
    };
  }, [servicesApi]);

  useEffect(() => {
    if (!servicesApi) return;
    const id = setInterval(() => servicesApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [servicesApi]);

  const avgRating = stats?.averageRating ?? (reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null);
  const totalReviewsCount = stats?.reviewCount ?? reviews.length;

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Page Hero */}
      <PageHero
        backgroundImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
        overlayOpacity={55}
        badge={<><Sparkles className="h-3.5 w-3.5" /> {TAGLINE}</>}
        title="Protect your home, calmly and thoroughly."
        subtitle={`${BUSINESS_NAME} provides certified, eco-conscious pest control for homes and businesses in ${SERVICE_AREAS.join(", ")}. Request a free quote and get a technician scheduled in minutes.`}
        actions={
          <>
            <Link href="/quote" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full bg-accent text-accent-foreground border-accent text-base font-semibold shadow-sm hover:brightness-95 btn-shine sm:w-auto"
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
                className="h-12 w-full border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15 backdrop-blur-xs sm:w-auto"
                data-testid="button-home-services"
              >
                View Services
              </Button>
            </Link>
          </>
        }
      />

      {/* 2. Trust Badges Banner */}
      <section className="bg-card border-b border-border/80 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TRUST_BADGES.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 shadow-2xs hover:border-primary/30 transition-all"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground sm:text-sm">{badge.title}</p>
                    <p className="text-[11px] text-text-muted hidden sm:block leading-snug">{badge.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Stats Bar Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-gradient-green border-b border-border/80 py-10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="card-lift rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold text-primary sm:text-3xl lg:text-4xl">
                {stats ? stats.totalCustomers.toLocaleString() : "10,000+"}
              </p>
              <p className="mt-1 text-xs font-medium text-text-muted sm:text-sm">Customers Served</p>
            </div>

            <div className="card-lift rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold text-primary sm:text-3xl lg:text-4xl">15+</p>
              <p className="mt-1 text-xs font-medium text-text-muted sm:text-sm">Years Experience</p>
            </div>

            <div className="card-lift rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold text-primary sm:text-3xl lg:text-4xl">
                {avgRating ? `${avgRating.toFixed(1)}/5` : "4.9/5"}
              </p>
              <p className="mt-1 text-xs font-medium text-text-muted sm:text-sm">Average Rating</p>
            </div>

            <div className="card-lift rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold text-primary sm:text-3xl lg:text-4xl">24/7</p>
              <p className="mt-1 text-xs font-medium text-text-muted sm:text-sm">Emergency Response</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Services Showcase */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-gradient-gray py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Highlights */}
          <div className="mb-12 grid gap-4 lg:grid-cols-4">
            {HERO_IMAGE_PALETTE.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="group card-lift overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/80 backdrop-blur-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold text-white drop-shadow-xs">{item.title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs leading-relaxed text-text-muted sm:text-sm">{item.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Comprehensive Protection</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Our Specialized Services</h2>
              <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
                Every service is backed by certified technicians, low-toxicity eco-friendly products, and a complete satisfaction warranty.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Licensed & Discreet Execution
            </div>
          </div>

          {/* Service Cards Carousel */}
          <div className="mt-8 relative">
            <Carousel
              opts={{ align: "start", loop: true }}
              setApi={setServicesApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6">
                {(services.length ? services.slice(0, 4) : FEATURED_SERVICES).map((s) => {
                  const displayPrice = (s as ServiceItem).basePrice
                    ? `From ₹${(s as ServiceItem).basePrice}`
                    : (s as typeof FEATURED_SERVICES[0]).basePrice
                    ? `From ₹${(s as typeof FEATURED_SERVICES[0]).basePrice}`
                    : "Starting at ₹999";

                  return (
                    <CarouselItem
                      key={s.slug}
                      className="pl-4 sm:pl-6 basis-full sm:basis-1/2 lg:basis-1/4"
                    >
                      <div className="group card-interactive flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm h-full">
                        <div>
                          <div className="relative">
                            <ServiceCardImage slug={s.slug} alt={s.name} />
                            <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs">
                              {displayPrice}
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-3">{s.description}</p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 mt-auto border-t border-border/60">
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <Link href={`/services/${s.slug}`} data-testid={`link-service-${s.slug}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs font-semibold h-9"
                              >
                                Learn More
                              </Button>
                            </Link>
                            <Link href={`/quote?service=${s.slug}`}>
                              <Button
                                size="sm"
                                className="w-full text-xs font-semibold h-9 bg-primary text-primary-foreground hover:brightness-110"
                              >
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {/* Navigation Arrows */}
              <button
                onClick={() => servicesApi?.scrollPrev()}
                disabled={!servicesApi?.canScrollPrev()}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous services"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={() => servicesApi?.scrollNext()}
                disabled={!servicesApi?.canScrollNext()}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next services"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </Carousel>

            {/* Pagination Dots */}
            {servicesCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: servicesCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => servicesApi?.scrollTo(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === servicesCurrent
                        ? "w-6 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/services">
              <Button size="lg" variant="outline" className="h-11 px-8 font-semibold text-sm shadow-2xs" data-testid="button-all-services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 5. How It Works - Process Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-card border-y border-border/80 py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple 4-Step Process</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">How It Works</h2>
            <p className="mt-2 text-sm text-text-muted sm:text-base">
              From free inspection to long-term warranty, we make professional pest control seamless and hassle-free.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                {/* Connecting arrow line on desktop */}
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs">
                      {step.stepNum}
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {step.subtitle}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted sm:text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. Why Choose Us Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-gradient-green py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Unmatched Quality</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Why Choose Us</h2>
            <p className="mt-3 text-sm text-text-muted sm:text-base">
              With over 15 years of industry leadership, we deliver the most reliable, safe, and professional pest control services for residential and commercial spaces across the country.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {WHY_CHOOSE_US.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="card-interactive flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                  data-testid={`why-choose-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-float-slow">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base sm:text-lg">{item.title}</h3>
                    <p className="mt-2 text-xs text-text-muted leading-relaxed sm:text-sm">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 7. Testimonials Carousel Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-gradient-gray border-y border-border/80 py-14 sm:py-20"
        data-testid="section-testimonials"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Verified Reviews</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">What Our Clients Say</h2>
              <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
                Real feedback from homeowners and businesses we've served.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {avgRating !== null && totalReviewsCount > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-2xs" data-testid="rating-summary">
                  <Stars value={Math.round(avgRating)} />
                  <div className="text-sm">
                    <span className="font-bold text-foreground" data-testid="text-overall-rating">{avgRating.toFixed(1)}/5</span>
                    <span className="text-text-muted ml-1 font-medium text-xs sm:text-sm" data-testid="text-reviews-count">
                      ({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCarousel("left")}
                    className="h-10 w-10 rounded-full border-border bg-card shadow-2xs hover:bg-secondary"
                    aria-label="Previous testimonials"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCarousel("right")}
                    className="h-10 w-10 rounded-full border-border bg-card shadow-2xs hover:bg-secondary"
                    aria-label="Next testimonials"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="relative mt-8">
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
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
                  const name = customer?.name ?? "Satisfied Client";
                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <div
                      key={r._id}
                      className="snap-start flex-none w-[300px] sm:w-[360px] flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm card-interactive"
                      data-testid={`testimonial-${r._id}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Stars value={r.rating} />
                          {dateStr && <span className="text-xs text-text-muted">{dateStr}</span>}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-white shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-foreground">{name}</p>
                              <BadgeCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                            {service?.name && <p className="text-xs text-text-muted">{service.name}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xs">
              <ShieldCheck className="h-10 w-10 text-primary/60" />
              <p className="text-sm text-text-muted max-w-md">
                Customer reviews will appear here once we receive feedback from our clients.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* 8. FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-card py-14 sm:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Got Questions?</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-text-muted sm:text-base">Everything you need to know about our services and safety standards.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={faq.question} value={`faq-${idx}`} className="rounded-2xl border border-border/80 bg-background/50 px-5 shadow-2xs overflow-hidden">
                <AccordionTrigger data-testid={`faq-trigger-${idx}`} className="text-base font-semibold py-4 hover:no-underline text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-muted pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* 9. CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-background text-foreground py-16 sm:py-20 relative overflow-hidden border-t-4 border-accent"
      >
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Rapid Response Team
            </span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              Serving {SERVICE_AREAS.join(", ")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base leading-relaxed">
              Ready to safeguard your property from pests? Get a instant free quote and schedule your certified inspection today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/quote" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full bg-primary px-8 text-base font-semibold text-primary-foreground border-primary shadow-md hover:brightness-110 btn-shine sm:w-auto"
                  data-testid="button-cta-quote"
                >
                  Get Free Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-primary/30 text-primary font-semibold hover:bg-primary/10 sm:w-auto"
                >
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}
