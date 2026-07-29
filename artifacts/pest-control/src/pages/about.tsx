import { SERVICE_AREAS, BUSINESS_NAME } from "@/config/business";
import PageHero from "@/components/page-hero";
import { Award, UserCheck, Leaf, Zap, Tag, Globe, Headphones, ThumbsUp, ShieldCheck, Target, Eye } from "lucide-react";

const REASONS = [
  { icon: Award, title: "15+ Years Experience", desc: "Over a decade of proven pest control excellence." },
  { icon: UserCheck, title: "Certified Technicians", desc: "Background-verified, certified, and regularly trained staff." },
  { icon: Leaf, title: "Eco-Friendly Treatments", desc: "WHO-approved, low-toxicity formulations safe for families and pets." },
  { icon: Zap, title: "Same-Day Service", desc: "Fast response for urgent pest infestations." },
  { icon: Tag, title: "Transparent Pricing", desc: "Upfront quotes with zero hidden charges." },
  { icon: Globe, title: "PAN India Coverage", desc: "Serving major cities and suburbs nationwide." },
  { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock helpdesk for all your queries." },
  { icon: ThumbsUp, title: "Satisfaction Guarantee", desc: "Free re-treatment if pests return during warranty." },
];

export default function About() {
  return (
    <>
      <PageHero
        backgroundImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80"
        overlayOpacity={60}
        badge="About Us"
        title={`About ${BUSINESS_NAME}`}
        subtitle="Trusted eco-friendly pest control serving households and businesses with certified, safe, and effective methods tailored to local conditions."
      />

      {/* Stats Bar */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 sm:gap-4 sm:px-6 sm:py-8">
          {[
            { value: "15+", label: "Years Experience" },
            { value: "10,000+", label: "Customers Served" },
            { value: "25+", label: "Service Areas" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              To deliver safe, effective, and eco-conscious pest control solutions that protect homes and businesses
              while respecting the environment and the health of our customers.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Vision</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              To be India's most trusted pest control brand — known for certified expertise, transparent pricing,
              and a genuine commitment to customer safety and satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Globe className="h-5 w-5" />
            <h2 className="text-xl font-bold text-foreground">Service Areas</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We operate across {SERVICE_AREAS.join(", ")}. If you're unsure whether we serve your area,
            contact us via the <a href="/contact" className="text-primary font-medium underline underline-offset-4">contact page</a>.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-secondary/25 border-y border-border/70">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why Choose Us</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              We deliver reliable, safe, and professional pest control services.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{reason.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{reason.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary-foreground/80 mb-4" />
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to Protect Your Space?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Get a free inspection and quote from our certified technicians today.
          </p>
          <a href="/quote" className="inline-block mt-6">
            <span className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-accent text-accent-foreground font-semibold text-sm shadow-sm hover:brightness-95 transition-all">
              Get Free Quote
            </span>
          </a>
        </div>
      </section>
    </>
  );
}
