import { SERVICE_AREAS } from "@/config/business";

const REASONS = [
  "Professional certified technicians",
  "Eco-friendly and safe treatments",
  "Transparent pricing and guarantees",
  "Fast response time across our service areas",
];

export default function About() {
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <h1 className="text-primary">About Utkal Pest Control</h1>
      <p className="mt-4 max-w-2xl text-text-muted">
        Utkal Pest Control is a trusted eco-friendly pest control company serving households and
        businesses in local communities. Our certified technicians use safe, effective methods
        tailored to local conditions.
      </p>

      <section className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2>Service Areas</h2>
        <p className="mt-2 text-text-muted">
          We operate across the following areas: {SERVICE_AREAS.join(", ")}. If you're unsure
          whether we serve your area, contact us via the contact page.
        </p>
      </section>

      <section className="mt-6">
        <h2>Why Choose Us</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm shadow-sm"
            >
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-success"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6.5 10.5l2.2 2.2 4.8-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-foreground">{reason}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
