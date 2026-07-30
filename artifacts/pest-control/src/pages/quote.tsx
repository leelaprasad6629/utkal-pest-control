import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import { motion } from "framer-motion";
import PageHero from "@/components/page-hero";
import { 
  ShieldCheck, 
  Award, 
  Users, 
  MapPin, 
  Smile, 
  UserPlus, 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  Sparkles, 
  HelpCircle
} from "lucide-react";

interface ValidationErrors {
  service?: string;
  address?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  date?: string;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs text-destructive font-medium animate-fade-in" role="alert">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

const STATS_ITEMS = [
  { icon: Award, value: "15+", label: "Years Experience" },
  { icon: Users, value: "10,000+", label: "Happy Customers" },
  { icon: MapPin, value: "25+", label: "Service Areas" },
  { icon: Smile, value: "98%", label: "Satisfaction Rate" },
];

const TRUST_POINTS = [
  { title: "15+ Years of Experience", desc: "Proven track record protecting homes and commercial buildings." },
  { title: "Certified Professionals", desc: "Expert technicians regularly trained on latest pest control protocols." },
  { title: "Eco-Friendly Treatments", desc: "Child and pet safe products approved by regulatory bodies." },
  { title: "Affordable Pricing", desc: "Transparent upfront pricing with zero hidden charges or surprise fees." },
  { title: "Same-Day Service", desc: "Fast inspection and treatment when you face urgent pest infestations." },
  { title: "Satisfaction Guarantee", desc: "If pests return within the warranty period, we treat your property again for free." },
];

const FAQS = [
  {
    q: "What should I do before the technician arrives?",
    a: "We recommend clearing the active service areas, removing open food items, and keeping pets in a separate room. Our team will share detailed preparation steps after confirming your slot.",
  },
  {
    q: "Are the treatments safe for my family and pets?",
    a: "Yes, we prioritize WHO-approved, low-toxicity, and eco-friendly products. We advise children and pets to stay out of the treated rooms for 2-3 hours immediately following application.",
  },
  {
    q: "How long does a typical service take?",
    a: "Most residential pest control treatments take between 45 minutes to 2 hours, depending on the property size and type of service.",
  },
  {
    q: "Do you offer a warranty on your services?",
    a: "Yes, most of our treatment plans come with a standard warranty period. If pests return during the warranty term, we will re-treat your space at no additional cost.",
  },
];

function BookingConfirmation({
  bookingId,
  bookingNumber,
  serviceName,
  scheduledDate,
  address,
  onNewBooking,
}: {
  bookingId: string;
  bookingNumber: string;
  serviceName: string;
  scheduledDate: string;
  address: string;
  onNewBooking: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl text-center space-y-6"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Booking Confirmed!</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your service request has been securely registered. Our dispatch team will call you shortly to confirm technician arrival.
        </p>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/40 p-5 text-left space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <span className="text-muted-foreground font-medium">Booking Number</span>
          <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
            {bookingNumber}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Service</span>
          <span className="font-semibold text-foreground">{serviceName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Scheduled Date</span>
          <span className="font-semibold text-foreground">
            {new Date(scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4 pt-1">
          <span className="text-muted-foreground font-medium shrink-0">Address</span>
          <span className="font-semibold text-foreground text-right max-w-[220px] break-words">{address}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href={`/bookings/${bookingId}`} className="flex-1">
          <Button className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" data-testid="button-view-booking">
            View Booking
          </Button>
        </Link>
        <Button variant="outline" className="flex-1 h-11 text-sm font-semibold rounded-xl border-border" onClick={onNewBooking} data-testid="button-new-booking">
          Book Another
        </Button>
      </div>
    </motion.div>
  );
}

export default function Quote() {
  const { isSignedIn, getToken } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [propertyType, setPropertyType] = useState<"residential" | "commercial">("residential");
  const [areaSize, setAreaSize] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00-11:00");
  const [notes, setNotes] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    bookingNumber: string;
    serviceName: string;
    scheduledDate: string;
    address: string;
  } | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(console.error);
  }, []);

  function validate(): ValidationErrors {
    const errs: ValidationErrors = {};
    if (!serviceId) errs.service = "Please select a service";
    if (!address.trim()) errs.address = "Street address is required";
    if (!city.trim()) errs.city = "City is required";
    if (!pincode.trim()) errs.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(pincode.trim())) errs.pincode = "Pincode must be exactly 6 digits";
    if (!date) errs.date = "Please choose a preferred date";
    else {
      const chosen = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) errs.date = "Date must be today or in the future";
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const token = await getToken();
      const payload = {
        serviceId,
        address: { line1: address, city, pincode },
        propertyType,
        areaSize: areaSize ? Number(areaSize) : undefined,
        scheduledDate: new Date(date).toISOString(),
        timeSlot,
        notes: notes || undefined,
        emergency,
      };
      const booking = await apiFetch<{ _id: string; bookingNumber: string }>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      });
      const svc = services.find((s) => s._id === serviceId);
      setConfirmedBooking({
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        serviceName: svc?.name ?? "Service",
        scheduledDate: new Date(date).toISOString(),
        address: [address, city, pincode].filter(Boolean).join(", "),
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to create quote. Please try again.");
    }
  }

  function resetForm() {
    setServiceId(""); setAddress(""); setCity(""); setPincode("");
    setAreaSize(""); setDate(""); setNotes(""); setEmergency(false);
    setPropertyType("residential"); setTimeSlot("09:00-11:00");
    setStatus("idle"); setErrorMessage(null); setValidationErrors({});
    setConfirmedBooking(null);
  }

  const handleHeroCtaClick = () => {
    const el = document.getElementById("booking-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <PageHero
        backgroundImage="/images/heroes/quote-hero.jpg"
        overlayOpacity={55}
        badge={<><Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> Reliable Pest Solutions</>}
        title="Book Your Pest Control Service"
        subtitle="Request a free inspection and receive a customized quote from our experts."
        actions={
          <Button
            onClick={handleHeroCtaClick}
            size="lg"
            className="h-12 px-8 font-semibold bg-accent text-accent-foreground border-accent hover:brightness-95 shadow-md rounded-xl transition-all"
          >
            Book Service Now
          </Button>
        }
      />

      {/* Main Two-Column Content */}
      <div id="booking-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Trust, Stats, How it Works, FAQs (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Why Choose Us */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck className="w-4 h-4" /> Why Choose Us
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Why Choose Utkal Pest Control?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                  We are dedicated to providing the safest, most effective pest treatments for families and businesses nationwide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRUST_POINTS.map((point) => (
                  <div key={point.title} className="glass-card card-interactive rounded-xl p-4 shadow-2xs space-y-1.5 border border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">{point.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-10">{point.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Statistics Cards */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {STATS_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-card border border-border/80 p-4 rounded-xl text-center space-y-1 hover:border-primary/30 transition-all shadow-2xs">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-primary font-display pt-1">{item.value}</p>
                    <p className="text-[11px] font-medium text-muted-foreground leading-tight">{item.label}</p>
                  </div>
                );
              })}
            </motion.section>

            {/* How It Works */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
                <p className="text-xs text-muted-foreground">Four simple steps to a pest-free home.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { step: "1", icon: UserPlus, label: "Sign In", desc: "Create or sign in to your dashboard" },
                  { step: "2", icon: FileText, label: "Request Quote", desc: "Select services & schedule details" },
                  { step: "3", icon: PhoneCall, label: "Confirm Date", desc: "Our team contacts you to confirm" },
                  { step: "4", icon: CheckCircle2, label: "Get Service", desc: "Technician performs the treatment" },
                ].map((s) => {
                  const StepIcon = s.icon;
                  return (
                    <div key={s.step} className="bg-card border border-border/80 p-4 rounded-xl text-center space-y-2 relative shadow-2xs hover:border-primary/30 transition-all">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                        {s.step}
                      </div>
                      <StepIcon className="w-5 h-5 mx-auto text-primary/80" />
                      <h4 className="text-xs font-bold text-foreground">{s.label}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* FAQ Accordion */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2.5">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={faq.q} value={`faq-${idx}`} className="border border-border/80 rounded-xl px-4 bg-card shadow-2xs hover:border-primary/30 transition-all duration-300">
                    <AccordionTrigger className="text-xs sm:text-sm font-semibold py-3.5 hover:no-underline text-foreground text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          </div>

          {/* Right Column: Sign In Card OR Booking Form (lg:col-span-5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            
            {/* If Confirmed Booking exists */}
            {status === "done" && confirmedBooking ? (
              <BookingConfirmation
                bookingId={confirmedBooking.id}
                bookingNumber={confirmedBooking.bookingNumber}
                serviceName={confirmedBooking.serviceName}
                scheduledDate={confirmedBooking.scheduledDate}
                address={confirmedBooking.address}
                onNewBooking={resetForm}
              />
            ) : !isSignedIn ? (
              
              /* Sign In Card */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Secure Quote Booking</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Signing in helps you securely track your booking history, view quotes, pay invoices, and contact technicians directly.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Instant status updates & notifications.</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Secure chat with assigned technicians.</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Downloadable bills & invoice records.</span>
                  </div>
                </div>

                <div>
                  <SignInButton mode="modal">
                    <Button size="lg" className="w-full h-12 text-sm font-semibold shadow-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-sign-in-quote">
                      Sign In to Request Quote
                    </Button>
                  </SignInButton>
                </div>
              </motion.div>

            ) : (

              /* Booking Form Card */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6"
              >
                <div className="border-b border-border/60 pb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">Service Request Form</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Step 1 of 1
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide details below to calculate service requirements.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Service */}
                  <div className="space-y-1.5">
                    <Label htmlFor="service" className="text-xs font-semibold text-foreground">
                      Service Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger id="service" data-testid="select-service" className="h-10 text-xs sm:text-sm rounded-xl">
                        <SelectValue placeholder="Select a service..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.pricing})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError msg={validationErrors.service} />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold text-foreground">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/flat number, street name"
                      data-testid="input-address"
                      className="h-10 text-xs sm:text-sm rounded-xl bg-background"
                    />
                    <FieldError msg={validationErrors.address} />
                  </div>

                  {/* City & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-foreground">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="city" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        data-testid="input-city" 
                        placeholder="e.g. Bhubaneswar"
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background"
                      />
                      <FieldError msg={validationErrors.city} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-semibold text-foreground">
                        Pincode <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        data-testid="input-pincode"
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background"
                      />
                      <FieldError msg={validationErrors.pincode} />
                    </div>
                  </div>

                  {/* Property Type & Area Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="property-type" className="text-xs font-semibold text-foreground">Property Type</Label>
                      <Select value={propertyType} onValueChange={(v) => setPropertyType(v as "residential" | "commercial")}>
                        <SelectTrigger id="property-type" className="h-10 text-xs sm:text-sm rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="area-size" className="text-xs font-semibold text-foreground">Area Size (sq ft)</Label>
                      <Input 
                        id="area-size" 
                        type="number" 
                        value={areaSize} 
                        onChange={(e) => setAreaSize(e.target.value)}
                        placeholder="e.g. 1200"
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-xs font-semibold text-foreground">
                        Preferred Date <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        data-testid="input-date"
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background"
                      />
                      <FieldError msg={validationErrors.date} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="time-slot" className="text-xs font-semibold text-foreground">Time Slot</Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger id="time-slot" className="h-10 text-xs sm:text-sm rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00-11:00">9:00 AM – 11:00 AM</SelectItem>
                          <SelectItem value="11:00-13:00">11:00 AM – 1:00 PM</SelectItem>
                          <SelectItem value="14:00-16:00">2:00 PM – 4:00 PM</SelectItem>
                          <SelectItem value="16:00-18:00">4:00 PM – 6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-xs font-semibold text-foreground">Additional Notes</Label>
                    <Textarea 
                      id="notes" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns, access instructions, pest type, etc."
                      rows={3}
                      className="text-xs sm:text-sm rounded-xl resize-y bg-background"
                    />
                  </div>

                  {/* Emergency Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox 
                      id="emergency" 
                      checked={emergency}
                      onCheckedChange={(v) => setEmergency(v === true)}
                    />
                    <Label htmlFor="emergency" className="text-xs font-medium text-foreground cursor-pointer">
                      This is an emergency request (Priority Dispatch)
                    </Label>
                  </div>

                  {/* Error Message */}
                  {status === "error" && errorMessage && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-fade-in" role="alert">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={status === "submitting"}
                    className="w-full h-12 text-sm sm:text-base font-semibold rounded-xl shadow-md btn-shine bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                    data-testid="button-submit-booking"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin inline-block" />
                        Submitting Request...
                      </span>
                    ) : (
                      "Request Quote"
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
