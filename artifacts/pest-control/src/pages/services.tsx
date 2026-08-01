import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Residential", "Commercial", "Termite", "Rodent", "Specialized"];

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message));
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
  }, [emblaApi, services, selectedCategory]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Residential") return s.category?.toLowerCase() === "residential" || s.slug.includes("residential");
    if (selectedCategory === "Commercial") return s.category?.toLowerCase() === "commercial" || s.slug.includes("commercial");
    if (selectedCategory === "Termite") return s.slug.includes("termite");
    if (selectedCategory === "Rodent") return s.slug.includes("rodent");
    if (selectedCategory === "Specialized") return !s.slug.includes("residential") && !s.slug.includes("commercial");
    return true;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Our Services</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-muted max-w-lg leading-relaxed">
            Explore certified, eco-conscious pest control solutions tailored for your home or business.
          </p>
        </div>

        {/* Navigation Arrows */}
        {filteredServices.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
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
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="h-8 px-3.5 text-xs font-semibold rounded-full shrink-0 transition-colors"
          >
            {cat}
          </Button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-destructive" data-testid="text-error">
          {error}
        </p>
      )}

      {/* Responsive Services Carousel (3 cards Desktop / 2 Tablet / 1 Mobile) */}
      {filteredServices.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex -ml-4">
              {filteredServices.map((s) => (
                <div
                  key={s._id}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-4"
                >
                  <Link
                    href={`/services/${s.slug}`}
                    className="card-interactive flex flex-col justify-between h-full rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-primary/40 transition-all space-y-3"
                    data-testid={`link-service-${s.slug}`}
                  >
                    <div className="space-y-2">
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
                        {s.duration ?? "Same-day available"}
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

          {/* Pagination Dots */}
          {scrollSnaps.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-1">
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
          )}
        </div>
      ) : (
        !error && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-text-muted">
            No services found for this category.
          </div>
        )
      )}
    </main>
  );
}
