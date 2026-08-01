import { SERVICE_AREAS, BUSINESS_NAME } from "@/config/business";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Compass, CheckCircle2 } from "lucide-react";

const REASONS = [
  "Professional certified technicians",
  "Eco-friendly and safe treatments",
  "Transparent pricing and guarantees",
  "Fast response time across our service areas",
];

export default function About() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-6 sm:space-y-8">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">About {BUSINESS_NAME}</h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          A trusted eco-friendly pest control provider dedicated to protecting homes and businesses with safe, certified, and effective treatments.
        </p>
      </section>

      {/* Mission & Vision - Compact Side-by-Side Cards on Desktop */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-base font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              To deliver prompt, eco-conscious, and government-approved pest management services that ensure complete peace of mind for families and businesses across our communities.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <div className="p-2 rounded-lg bg-primary/10">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-base font-bold text-foreground">Our Vision</h2>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              To be India's most reliable and technologically advanced pest control company, recognized for environmental stewardship, safety excellence, and 100% customer satisfaction.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Service Areas */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
        <h2 className="text-base font-bold text-foreground">Service Coverage</h2>
        <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed">
          We operate across {SERVICE_AREAS.join(", ")} and surrounding regions. Need service in your location? Contact our support team for immediate scheduling.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-foreground">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REASONS.map((reason) => (
            <div
              key={reason}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-xs sm:text-sm shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-foreground font-medium">{reason}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
