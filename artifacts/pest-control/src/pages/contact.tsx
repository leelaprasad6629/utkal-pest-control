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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-fade-in space-y-12 sm:space-y-16">
      {/* Hero / Header Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wide uppercase">
          <Headphones className="w-4 h-4" />
          Get In Touch
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          We're Here to Protect Your Space
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Have a question about our pest control services, need a free inspection quote, or require immediate assistance? 
          Send us a message and our team will respond promptly.
        </p>

        {/* Feature Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-2xs">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Fast 24/7 Response</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Licensed Professionals</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-2xs">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span>Serving Across India</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Contact Information</h2>
            <p className="text-sm text-muted-foreground">Reach out to us directly through any of our channels below.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Address / Service Network Card */}
            <Card className="hover:border-primary/40 transition-colors shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Service Coverage</h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Serving customers across India. Our support team connects you with the nearest service professional.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="hover:border-primary/40 transition-colors shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Phone & Hotline</h3>
                  <div className="flex flex-col text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">Phone: To be updated</p>
                    <p>Customer Support: To be updated</p>
                  </div>
                  <span className="inline-block text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    Emergency Line Active
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="hover:border-primary/40 transition-colors shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
                  <div className="flex flex-col text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">Support: contact@utkalpestcontrol.com</p>
                    <p>Inquiries: info@utkalpestcontrol.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours Card */}
            <Card className="hover:border-primary/40 transition-colors shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Working Hours</h3>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p><strong className="font-medium text-foreground">Mon – Sat:</strong> 8:00 AM – 8:00 PM</p>
                    <p><strong className="font-medium text-foreground">Sunday:</strong> Emergency Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Contact Form Card */}
        <div className="lg:col-span-7">
          <Card className="shadow-md border-border/80 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 sm:p-8 bg-muted/30 border-b border-border/60">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Send Us a Message</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Complete the form below and an expert technician will review your inquiry within 2 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rajesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                      data-testid="input-name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
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
                      className="h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 px-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="input-phone"
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
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
                    className="p-4 text-base md:text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-primary resize-y min-h-[120px]"
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
        </div>
      </div>

      {/* Pan-India Service Section */}
      <section className="space-y-4 pt-4 sm:pt-6">
        <Card className="border-border bg-gradient-to-r from-primary/5 via-card to-primary/5 rounded-2xl p-6 sm:p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Nationwide Service Network</h2>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We provide pest control services across India. Contact us and we will connect you with the nearest service team.
          </p>
        </Card>
      </section>
    </main>
  );
}

