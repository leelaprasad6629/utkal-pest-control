import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import PageHero from "@/components/page-hero";
import { 
  MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, Zap, Headphones, Globe
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
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch {
      setStatus("error");
    }
  }

  const CONTACT_CARDS = [
    { icon: MapPin, title: "Service Coverage", body: "Serving customers across India. Our support connects you with local experts." },
    { icon: Phone, title: "Phone & Hotline", body: "Phone: To be updated", badge: "24/7 Active" },
    { icon: Mail, title: "Email Support", body: "contact@utkalpestcontrol.com\ninfo@utkalpestcontrol.com" },
    { icon: Clock, title: "Working Hours", body: "Mon – Sat: 8:00 AM – 8:00 PM\nSunday: Emergency Only" },
  ];

  return (
    <>
      <PageHero
        backgroundImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
        overlayOpacity={60}
        badge={<><Headphones className="w-3.5 h-3.5" /> Get In Touch</>}
        title="We're Here to Protect Your Space"
        subtitle="Have a question about our pest control services, need a free inspection quote, or require immediate assistance? Send us a message and our team will respond promptly."
      />

      {/* Feature Badges */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: Zap, text: "Fast 24/7 Response", color: "text-amber-500" },
              { icon: ShieldCheck, text: "Licensed Professionals", color: "text-emerald-500" },
              { icon: Globe, text: "Serving Across India", color: "text-primary" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.text} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                  <Icon className={`w-4 h-4 shrink-0 ${badge.color}`} />
                  <span className="text-xs sm:text-sm font-medium text-foreground">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="rounded-2xl border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-card">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    {card.body.split("\n").map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                    ))}
                    {card.badge && (
                      <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {card.badge}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto w-full mt-10">
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-card border-border">
            <CardHeader className="p-6 sm:p-8 bg-muted/30 border-b border-border text-center">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Send Us a Message</CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-lg mx-auto mt-1">
                Complete the form below and an expert technician will review your inquiry within 2 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                <div className="space-y-2 w-full">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
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

                <div className="space-y-2 w-full">
                  <Label htmlFor="message" className="text-sm font-semibold text-foreground">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your pest control issue, preferred service date, or any questions you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 text-base md:text-sm rounded-lg resize-none focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="input-message"
                  />
                </div>

                {status === "sent" && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Message sent! We'll get back to you within 2 hours.</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Something went wrong. Please try again or email us directly.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "sending" || status === "sent"}
                  className="w-full h-12 text-sm font-semibold rounded-lg"
                  data-testid="button-send-message"
                >
                  {status === "sending" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : status === "sent" ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Message Sent!</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Message</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pan-India Service */}
        <div className="max-w-3xl mx-auto mt-10">
          <Card className="rounded-2xl border-border bg-card shadow-sm p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Nationwide Service Network</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              We provide pest control services across India. Contact us and we will connect you with the nearest service team.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
