import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServiceCardImage from "@/components/service-card-image";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Zap,
  Star,
  Home,
  Building2,
  Bug,
  Mouse,
  Cloud,
  Bed,
  Leaf,
  Sparkles,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

/** Maps service slug to a corresponding Lucide icon */
function getServiceIcon(slug: string) {
  switch (slug) {
    case "residential-pest-control":
      return Home;
    case "commercial-pest-control":
      return Building2;
    case "rodent-control":
      return Mouse;
    case "mosquito-fumigation":
      return Cloud;
    case "bed-bug-treatment":
      return Bed;
    case "agri-advisory":
      return Leaf;
    case "termite-control":
      return Shield;
    case "cockroach-control":
    default:
      return Bug;
  }
}

export default function Services() {
  // Render static data instantly — no loading spinner, no blank state.
  const [services, setServices] = useState<ServiceItem[]>(STATIC_SERVICES);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // ── Carousel state ──
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState(0);
  const [carouselCount, setCarouselCount] = useState(0);

  useEffect(() => {
    // Fetch from the API in the background; if it succeeds, replace static
    // data with live DB records. If it fails, keep the static list.
    apiFetch<ServiceItem[]>("/services")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  // ── Carousel: sync pagination on select/reInit ──
  useEffect(() => {
    if (!carouselApi) return;
    const sync = () => {
      setCarouselCount(carouselApi.scrollSnapList().length);
      setCarouselCurrent(carouselApi.selectedScrollSnap());
    };
    sync();
    carouselApi.on("select", sync);
    carouselApi.on("reInit", sync);
    return () => {
      carouselApi.off("select", sync);
      carouselApi.off("reInit", sync);
    };
  }, [carouselApi]);

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <>
      <PageHero
        backgroundImage="/images/heroes/services-hero.jpg"
        overlayOpacity={60}
        badge={
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" /> Premium Pest Management
          </span>
        }
        title="Our Pest Control Services"
        subtitle="Browse our comprehensive, eco-friendly pest management solutions tailored for residential homes, commercial properties, and specialized environments."
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/quote">
              <Button size="lg" className="btn-shine bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold">
                Get a Free Quote
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 lg:py-16 animate-fade-in">
        {error && (
          <p className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium" data-testid="text-error">
            {error}
          </p>
        )}

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat as string)}
                className={`rounded-full px-5 transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card hover:bg-secondary/60 text-muted-foreground border-border"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Services Carousel */}
        <div className="relative">
          <Carousel
            key={selectedCategory}
            opts={{ align: "start", loop: true }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-6 md:-ml-6">
          {filteredServices.map((s) => {
            const IconComponent = getServiceIcon(s.slug);

            return (
              <CarouselItem
                key={s._id}
                className="pl-4 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <Link
                  href={`/services/${s.slug}`}
                  data-testid={`link-service-${s.slug}`}
                  className="group card-interactive flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Container with Badge */}
                  <div className="relative overflow-hidden">
                    <ServiceCardImage slug={s.slug} alt={s.name} height="h-44" />
                    {s.category && (
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border-white/20 text-xs font-medium px-2.5 py-1">
                        {s.category}
                      </Badge>
                    )}
                    {typeof s.basePrice === "number" && (
                      <div className="absolute bottom-3 right-3 shrink-0 text-xs font-bold text-accent-foreground bg-accent/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-accent/40">
                        Starting at ₹{s.basePrice}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </h3>
                      </div>

                      {s.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </div>

                    {/* Features checklist highlights */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        Odorless & Safe
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        Govt Certified
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </span>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Link href={`/quote?service=${s.slug}`}>
                          <Button size="sm" variant="secondary" className="h-8 px-3 text-xs hover:bg-primary hover:text-white transition-colors">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
            </CarouselContent>

            {/* Navigation Arrows */}
            <button
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!carouselApi?.canScrollPrev()}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous services"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => carouselApi?.scrollNext()}
              disabled={!carouselApi?.canScrollNext()}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-md hover:bg-background hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next services"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </Carousel>

          {/* Pagination Dots */}
          {carouselCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: carouselCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === carouselCurrent
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Why Choose Us Section */}
        <section className="mt-20 pt-12 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary bg-primary/5">
              The Utkal Difference
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Why Homeowners & Businesses Trust Utkal Pest Control
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              We deliver science-backed pest elimination with zero compromise on safety or convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Eco-Friendly",
                desc: "WHO-approved, odorless formulations safe for children, elderly, and pets.",
              },
              {
                icon: CheckCircle2,
                title: "Certified Technicians",
                desc: "Rigorous background checks and ongoing pest entomology training.",
              },
              {
                icon: Clock,
                title: "Rapid 2-Hour Response",
                desc: "Emergency response team available for high-priority infestations.",
              },
              {
                icon: Star,
                title: "Service Guarantee",
                desc: "Hassle-free 30 to 90-day re-service warranty on all major treatments.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="card-lift p-6 rounded-2xl border border-border/80 bg-card shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-16 rounded-3xl overflow-hidden bg-background border-2 border-accent/40 text-foreground p-8 sm:p-12 shadow-xl relative">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Fast & Reliable
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
              Unsure which treatment fits your home or office?
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Our pest control specialists offer free on-site inspections and custom consultations with no obligation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/quote">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold btn-shine">
                  Request Free Inspection
                </Button>
              </Link>
              <a href="tel:+919876543210" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-4 py-2">
                <Phone className="w-4 h-4 text-accent" /> Call Expert Now
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
