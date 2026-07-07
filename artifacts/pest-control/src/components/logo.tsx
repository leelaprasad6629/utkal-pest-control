/** SVG logo — shield with checkmark motif, forest-green brand palette. */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Utkal Pest Control"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="20" cy="20" r="20" fill="#2a6641" />
      {/* Shield shape */}
      <path
        d="M20 8 L30 12.5 V21.5 C30 27.5 25.5 31.5 20 33.5 C14.5 31.5 10 27.5 10 21.5 V12.5 Z"
        fill="white"
        fillOpacity="0.12"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M14.5 20.5 L18.5 24.5 L25.5 15.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Horizontal lockup: icon + text name */
export function LogoLockup({
  size = 32,
  className,
  textClass,
}: {
  size?: number;
  className?: string;
  textClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} />
      <span className={`font-display font-semibold leading-tight ${textClass ?? ""}`}>
        Utkal Pest Control
      </span>
    </span>
  );
}
