import { Link } from "wouter";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAME } from "@/config/business";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-primary" data-testid="link-home">
          {BUSINESS_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/services" data-testid="link-services">
            Services
          </Link>
          <Link href="/about" data-testid="link-about">
            About
          </Link>
          <Link href="/contact" data-testid="link-contact">
            Contact
          </Link>
          <Link href="/quote">
            <Button size="sm" data-testid="button-get-quote">
              Get Quote
            </Button>
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="outline" data-testid="button-sign-in">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" data-testid="link-dashboard">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
