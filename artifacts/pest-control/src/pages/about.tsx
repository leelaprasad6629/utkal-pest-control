import { SERVICE_AREAS } from "@/config/business";

const REASONS = [
  "Professional certified technicians",
  "Eco-friendly and safe treatments",
  "Transparent pricing and guarantees",
  "Fast response time across our service areas",
];

export default function About() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/images/heroes/about-hero.jpg')" }}
    >
      {/* Dark overlay covering entire page */}
      <div className="min-h-screen bg-black/60">
        {/* Hero section */}
        <section className="flex items-center justify-center text-center text-white px-4 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              About Utkal Pest Control
            </h1>
            <p className="text-white/85 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Trusted eco-friendly pest control serving households and businesses with certified, safe, and effective methods tailored to local conditions.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-20 space-y-6">
          <section className="rounded-xl border border-white/20 bg-card/95 backdrop-blur-sm p-6 shadow-md">
            <h2 className="text-primary text-xl font-bold">Service Areas</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              We operate across the following areas: {SERVICE_AREAS.join(", ")}. If you're unsure
              whether we serve your area, contact us via the contact page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Why Choose Us</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {REASONS.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 rounded-lg border border-white/20 bg-card/90 backdrop-blur-sm p-4 text-sm shadow-md"
                >
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-success" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 10.5l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
