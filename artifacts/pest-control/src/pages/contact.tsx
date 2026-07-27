import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Headphones,
  Globe
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, message }),
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
        style={{ 
          backgroundImage: "url('/images/heroes/contact-hero.jpg')" 
        }}
      />
      {/* Readability Overlay */}
      <div className="fixed inset-0 z-0 bg-background/92 backdrop-blur-[1.5px] pointer-events-none" />

      {/* Hero Banner Section */}
      <section className="relative z-10 overflow-hidden bg-linear-to-br from-primary via-[hsl(155,43%,18%)] to-[hsl(155,43%,12%)] text-primary-foreground min-h-[300px] flex items-center border-b border-border/10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
          style={{ 
            backgroundImage: "url('/images/heroes/contact-hero.jpg')" 
          }}
        />
        {/* Dark Overlay (40-60%) */}
        <div className="absolute inset-0 z-0 bg-black/55 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <Headphones className="w-4 h-4" />
            Get In Touch
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            We're Here to Protect Your Space
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
            Have a question about our pest control services, need a free inspection quote, or require immediate assistance? 
            Send us a message and our team will respond promptly.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14">
        {/* Feature Badges */}
        <div className="-mt-16 sm:-mt-22 relative z-20 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Fast 24/7 Response</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Licensed Professionals</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span>Serving Across India</span>
          </div>
        </div>

      {/* Contact Info Cards - Balanced 4-Column Grid */}
      <section className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Service Coverage Card */}
          <Card className="hover:border-primary/40 transition-colors shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Service Coverage</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Serving customers across India. Our support connects you with local experts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="hover:border-primary/40 transition-colors shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Phone & Hotline</h3>
                <p className="text-xs text-muted-foreground font-medium text-foreground">Phone: To be updated</p>
                <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  24/7 Active
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="hover:border-primary/40 transition-colors shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
                <p className="text-xs text-muted-foreground break-all sm:break-words">contact@utkalpestcontrol.com</p>
                <p className="text-xs text-muted-foreground break-all sm:break-words">info@utkalpestcontrol.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours Card */}
          <Card className="hover:border-primary/40 transition-colors shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Working Hours</h3>
                <p className="text-xs text-muted-foreground">Mon – Sat: 8:00 AM – 8:00 PM</p>
                <p className="text-[11px] text-muted-foreground">Sunday: Emergency Only</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Centered Contact Form Section */}
      <section className="max-w-2xl sm:max-w-3xl mx-auto w-full">
        <Card className="shadow-md border-border/80 rounded-2xl overflow-hidden">
          <CardHeader className="p-6 sm:p-8 bg-muted/30 border-b border-border/60 text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Send Us a Message</CardTitle>
            <CardDescription className="text-sm text-muted-foreground max-w-lg mx-auto">
              Complete the form below and an expert technician will review your inquiry within 2 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="input-name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. rajesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2 w-full">
                <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                  data-testid="input-phone"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2 w-full">
                <Label htmlFor="message" className="text-sm font-semibold text-foreground">
                  Your Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about the pest issue, property type, or specific service required..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full p-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary resize-y min-h-[120px]"
                  data-testid="input-message"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={status === "sending"}
                className="w-full h-12 text-base font-semibold rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                data-testid="button-send-message"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {status === "sent" && (
                <div
                  className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300"
                  aria-live="polite"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium" data-testid="text-sent-confirmation">
                    Message sent — we'll contact you soon.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive"
                  aria-live="assertive"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium" data-testid="text-error">
                    Error sending message. Please try again later.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Pan-India Service Section */}
      <section className="max-w-3xl mx-auto space-y-4 pt-2">
        <Card className="border-border bg-gradient-to-r from-primary/5 via-card to-primary/5 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Nationwide Service Network</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We provide pest control services across India. Contact us and we will connect you with the nearest service team.
          </p>
        </Card>
      </section>
    </main>
    </div>
  );
}

