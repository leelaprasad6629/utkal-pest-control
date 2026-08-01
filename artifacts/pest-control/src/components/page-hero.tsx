import type { ReactNode } from "react";

type PageHeroProps = {
  image: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  size?: "lg" | "md" | "sm";
  align?: "left" | "center";
  /** Light text on dark overlay (default) or dark text on light overlay */
  variant?: "dark" | "light";
};

const SIZE_CLASSES = {
  lg: "min-h-[380px] sm:min-h-[460px] md:min-h-[520px]",
  md: "min-h-[280px] sm:min-h-[340px]",
  sm: "min-h-[220px] sm:min-h-[260px]",
} as const;

export default function PageHero({
  image,
  title,
  subtitle,
  children,
  size = "lg",
  align = "left",
  variant = "dark",
}: PageHeroProps) {
  const isDark = variant === "dark";

  return (
    <section className={`relative w-full overflow-hidden ${SIZE_CLASSES[size]}`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-hero-bg"
        style={{ backgroundImage: `url('${image}')` }}
        aria-hidden="true"
      />
      <div
        className={
          isDark
            ? "absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/85 to-[hsl(155,43%,10%)]/88"
            : "absolute inset-0 bg-background/80 backdrop-blur-[2px]"
        }
        aria-hidden="true"
      />

      <div
        className={`relative z-10 flex h-full items-center ${
          align === "center" ? "justify-center text-center" : ""
        }`}
      >
        <div
          className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16 animate-fade-in ${
            align === "center" ? "max-w-3xl" : ""
          }`}
        >
          <div className={isDark ? "text-primary-foreground" : "text-foreground"}>
            {typeof title === "string" ? (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-tight">
                {title}
              </h1>
            ) : (
              title
            )}
            {subtitle && (
              <p
                className={`mt-4 max-w-xl text-base sm:text-lg leading-relaxed ${
                  align === "center" ? "mx-auto" : ""
                } ${isDark ? "text-primary-foreground/80" : "text-muted-foreground"}`}
              >
                {subtitle}
              </p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

type SectionHeroProps = {
  image: string;
  children: ReactNode;
  className?: string;
};

/** Hero-style background for inline page sections (e.g. CTA bands). */
export function SectionHero({ image, children, className = "" }: SectionHeroProps) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-hero-bg"
        style={{ backgroundImage: `url('${image}')` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/82 to-[hsl(155,43%,10%)]/88"
        aria-hidden="true"
      />
      <div className="relative z-10 animate-fade-in">{children}</div>
    </section>
  );
}
