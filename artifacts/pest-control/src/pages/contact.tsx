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
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/images/heroes/contact-hero.jpg')" }}
    >
      {/* Dark overlay covering entire page */}
      <div className="min-h-screen bg-black/55">
        {/* Hero section */}
        <section className="flex items-center justify-center text-center text-white px-4 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
                <Headphones className="w-4 h-4" /> Get In Touch
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">We're Here to Protect Your Space</h1>
            <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Have a question about our pest control services, need a free inspection quote, or require immediate assistance? Send us a message and our team will respond promptly.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10 sm:space-y-12">
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fast 24/7 Response</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <Globe className="w-4 h-4 text-white/80 shrink-0" />
              <span>Serving Across India</span>
            </div>
          </div>

          {/* Contact Info Cards */}
          <section className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:border-primary/40 transition-colors shadow-md bg-card/90 backdrop-blur-sm border-white/20">
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

              <Card className="hover:border-primary/40 transition-colors shadow-md bg-card/90 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Phone & Hotline</h3>
                    <p className="text-xs text-muted-foreground font-medium">Phone: To be updated</p>
                    <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      24/7 Active
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-colors shadow-md bg-card/90 backdrop-blur-sm border-white/20">
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

              <Card className="hover:border-primary/40 transition-colors shadow-md bg-card/90 backdrop-blur-sm border-white/20">
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

          {/* Contact Form */}
          <section className="max-w-2xl sm:max-w-3xl mx-auto w-full">
            <Card className="shadow-md border-white/20 rounded-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
              <CardHeader className="p-6 sm:p-8 bg-muted/30 border-b border-border/60 text-center">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Send Us a Message</CardTitle>
                <CardDescription className="text-sm text-muted-foreground max-w-lg mx-auto">
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
          </section>

          {/* Pan-India Service Section */}
          <section className="max-w-3xl mx-auto space-y-4 pt-2 pb-4">
            <Card className="border-white/20 bg-card/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center shadow-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Nationwide Service Network</h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                We provide pest control services across India. Contact us and we will connect you with the nearest service team.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
