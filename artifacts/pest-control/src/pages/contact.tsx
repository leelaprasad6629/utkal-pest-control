import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import PageHero from "@/components/page-hero";
import { motion } from "framer-motion";
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
  Globe, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight,
  Sparkles
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <PageHero
        backgroundImage="/images/heroes/contact-hero.jpg"
        overlayOpacity={60}
        badge={
          <>
            <Headphones className="w-3.5 h-3.5 text-accent" /> Get In Touch
          </>
        }
        title="We're Here to Protect Your Space"
        subtitle="Have questions about our pest control services, need a free inspection quote, or require immediate emergency assistance? Reach out to our dedicated support team."
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12 lg:space-y-16">
        
        {/* Feature Badges Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 shadow-2xs">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Fast 24/7 Response</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Licensed Professionals</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-2xs">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span>Serving Across India</span>
          </div>
        </motion.div>

        {/* Contact Info Grid with Glassmorphism */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Contact Channels & Coverage
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose the method most convenient for you. Our team is standing by to respond promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Phone & Hotline Card */}
            <div className="glass-card card-interactive rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Phone & Hotline</h3>
                  <p className="text-xs text-muted-foreground mt-1">Direct support & instant phone inquiries.</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60">
                <p className="text-sm font-bold text-foreground">+91 98765 43210</p>
                <p className="text-[11px] text-muted-foreground">Toll-Free: 1800-123-4567</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 24/7 Active
                </span>
              </div>
            </div>

            {/* WhatsApp Support Card */}
            <div className="glass-card card-interactive rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">WhatsApp Chat</h3>
                  <p className="text-xs text-muted-foreground mt-1">Send photos of pests for instant estimate.</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60">
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>+91 98765 43210</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <p className="text-[11px] text-muted-foreground mt-0.5">Average reply in 5 mins</p>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="glass-card card-interactive rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Email Support</h3>
                  <p className="text-xs text-muted-foreground mt-1">Send detailed requirements or corporate RFPs.</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 space-y-0.5">
                <p className="text-xs font-semibold text-foreground truncate">contact@utkalpestcontrol.com</p>
                <p className="text-xs font-semibold text-muted-foreground truncate">info@utkalpestcontrol.com</p>
                <p className="text-[11px] text-muted-foreground mt-1">Response within 2 hours</p>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="glass-card card-interactive rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent-foreground flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Working Hours</h3>
                  <p className="text-xs text-muted-foreground mt-1">Operational support schedule.</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Mon – Sat: 8:00 AM – 8:00 PM</p>
                <p className="text-xs text-muted-foreground">Sunday: Emergency Dispatch Only</p>
                <span className="inline-block mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  On-Call Staff Always Ready
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Highlight Card */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-destructive/90 via-destructive to-amber-700 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
              <AlertTriangle className="w-48 h-48" />
            </div>
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 24/7 Urgent Dispatch
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Facing a Severe Pest Emergency?
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Termite swarms, severe rodent invasion, or venomous pest presence requiring immediate action? Our rapid response teams arrive within 60 minutes in major service hubs.
              </p>
            </div>
            <div className="shrink-0 relative z-10 w-full sm:w-auto">
              <a href="tel:+919876543210" className="w-full sm:w-auto inline-block">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 px-6 bg-white text-destructive hover:bg-white/90 font-bold rounded-xl shadow-md transition-transform hover:scale-[1.02]"
                >
                  <Phone className="w-4 h-4 mr-2 text-destructive" /> Call Emergency Hotline
                </Button>
              </a>
            </div>
          </div>
        </motion.section>

        {/* Contact Form & Map Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch"
        >
          {/* Left Column: Form (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col">
            <Card className="shadow-xl border border-border/80 rounded-2xl overflow-hidden bg-card flex-1 flex flex-col justify-between">
              <CardHeader className="p-6 sm:p-8 bg-muted/40 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
                  <Sparkles className="w-4 h-4" /> Message Direct
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  Send Us a Message
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Fill out the form below and an expert technician will review your inquiry within 2 hours.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Rajesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-11 px-4 text-sm rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary bg-background"
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. rajesh@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 px-4 text-sm rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary bg-background"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-4 text-sm rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary bg-background"
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="message" className="text-xs sm:text-sm font-semibold text-foreground">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your pest control issue, preferred service date, or any questions you have..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-3 text-sm rounded-xl border-border resize-none focus-visible:ring-2 focus-visible:ring-primary bg-background"
                      data-testid="input-message"
                    />
                  </div>

                  {status === "sent" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>Message sent! We'll get back to you within 2 hours.</span>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs sm:text-sm text-destructive font-medium"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>Something went wrong. Please try again or email us directly.</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === "sending" || status === "sent"}
                    className="w-full h-12 text-sm font-semibold rounded-xl btn-shine bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
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

          {/* Right Column: Embedded Map & HQ Address (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/80 min-h-[380px] lg:h-full flex-1 bg-muted">
              <iframe
                title="Utkal Pest Control Headquarters Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.123!2d85.8245!3d20.2961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sBhubaneswar%2C%20Odisha!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "360px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full filter grayscale-[15%] contrast-[1.05]"
              />
              
              {/* Overlay Location Info */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-card backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Central Headquarters</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Main Hub: Jaydev Vihar, Bhubaneswar, Odisha 751013
                    </p>
                    <p className="text-[10px] text-primary font-semibold mt-1">
                      + Local Dispatch Hubs Across All Major Indian Metro Cities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pan-India Service Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-muted/50 to-card p-6 sm:p-8 text-center shadow-md space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xl mx-auto">
              <h3 className="text-lg font-bold text-foreground">Nationwide Service Network</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We operate across India with verified local certified extermination teams in Eastern, Northern, Western, and Southern regions.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-muted-foreground font-medium">
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Bhubaneswar</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Cuttack</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Kolkata</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Delhi NCR</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Mumbai</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Bengaluru</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">Hyderabad</span>
              <span className="px-3 py-1 rounded-lg bg-background border border-border">+ 20 More Cities</span>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
