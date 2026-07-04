import { Link, useLocation } from "wouter";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAME } from "@/config/business";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/services", label: "Services", testId: "link-services" },
  { href: "/about", label: "About", testId: "link-about" },
  { href: "/contact", label: "Contact", testId: "link-contact" },
];

export default function SiteHeader() {
  const [location] = useLocation();

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-primary"
          data-testid="link-home"
        >
          {BUSINESS_NAME}
        </Link>
        <nav className="flex items-center gap-1 md:gap-2 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-testid={link.testId}
                className={cn(
                  "px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150",
                  isActive
                    ? "text-primary bg-secondary border-b-2 border-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted border-b-2 border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <SignedIn>
            <Link
              href="/dashboard"
              data-testid="link-dashboard"
              className={cn(
                "px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150",
                location === "/dashboard"
                  ? "text-primary bg-secondary border-b-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted border-b-2 border-transparent"
              )}
            >
              Dashboard
            </Link>
          </SignedIn>

          <Link href="/quote" className="ml-1 md:ml-2">
            <Button size="sm" data-testid="button-get-quote">
              Get Quote
            </Button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="outline" className="ml-1" data-testid="button-sign-in">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="ml-2">
              <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
            </div>
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
