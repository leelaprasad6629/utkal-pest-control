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
  Calendar, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Star, 
  HelpCircle,
  Info
} from "lucide-react";
import StarRating from "@/components/star-rating";

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
    <div className="mt-1 flex items-center gap-1.5 text-xs text-danger font-medium animate-fade-in" role="alert">
      <AlertCircle className="w-3.5 h-3.5" />
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
      className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 mb-4 animate-bounce-slow">
        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-primary">Booking Confirmed!</h2>
      <p className="mt-2 text-text-muted text-sm leading-relaxed">
        Your booking request has been securely registered. Our support team will contact you shortly to finalize details.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-secondary/35 p-5 text-left space-y-3.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-text-muted font-medium">Booking Number</span>
          <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">{bookingNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-medium">Service Name</span>
          <span className="font-semibold text-foreground">{serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-medium">Scheduled For</span>
          <span className="font-semibold text-foreground">
            {new Date(scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-medium">Address</span>
          <span className="font-semibold text-foreground text-right max-w-[200px] break-words">{address}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link href={`/bookings/${bookingId}`} className="flex-1">
          <Button className="w-full h-11 text-sm font-semibold" data-testid="button-view-booking">
            View Booking
          </Button>
        </Link>
        <Button variant="outline" className="flex-1 h-11 text-sm font-semibold" onClick={onNewBooking} data-testid="button-new-booking">
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
    <>
      <PageHero
        backgroundImage="/images/heroes/quote-hero.jpg"
        overlayOpacity={55}
        badge={<><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Reliable Pest Solutions</>}
        title="Book Your Pest Control Service"
        subtitle="Request a free inspection and receive a customized quote from our experts."
        actions={
          <Button
            onClick={handleHeroCtaClick}
            size="lg"
            className="h-12 px-8 font-semibold bg-accent text-accent-foreground border-accent hover:brightness-95 shadow-sm rounded-lg"
          >
            Book Service Now
          </Button>
        }
      />

      {/* Main Two-Column Content */}
      <div id="booking-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Trust, Stats, How it Works, FAQs */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Why Choose Us */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why Choose Utkal Pest Control?</h2>
                <p className="text-sm text-text-muted max-w-lg">
                  We are dedicated to providing the safest, most effective pest treatments for families and businesses nationwide.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {TRUST_POINTS.map((point) => (
                  <div key={point.title} className="flex gap-3 bg-card border border-border rounded-xl p-4 shadow-2xs">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground leading-snug">{point.title}</h4>
                      <p className="text-xs text-text-muted leading-relaxed">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Statistics Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-card border border-border p-4 rounded-xl text-center space-y-1 hover:border-primary/20 transition-all shadow-2xs">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-primary font-display pt-1">{item.value}</p>
                    <p className="text-[11px] font-medium text-text-muted leading-tight">{item.label}</p>
                  </div>
                );
              })}
            </section>

            {/* How It Works */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { step: "1", icon: UserPlus, label: "Sign In", desc: "Create or sign in to your dashboard" },
                  { step: "2", icon: FileText, label: "Request Quote", desc: "Select services & schedule details" },
                  { step: "3", icon: PhoneCall, label: "Confirm Date", desc: "Our team contacts you to confirm" },
                  { step: "4", icon: CheckCircle2, label: "Get Service", desc: "Technician performs the treatment" },
                ].map((s) => {
                  const StepIcon = s.icon;
                  return (
                    <div key={s.step} className="relative bg-card border border-border p-4 rounded-xl text-center space-y-2">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                        {s.step}
                      </div>
                      <StepIcon className="w-5 h-5 mx-auto text-primary/70" />
                      <h4 className="text-xs font-bold text-foreground">{s.label}</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={faq.q} value={`faq-${idx}`} className="border border-border/80 rounded-xl px-4 bg-card shadow-2xs hover:border-primary/20 transition-all duration-300">
                    <AccordionTrigger className="text-sm font-semibold py-3.5 hover:no-underline text-foreground text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-text-muted pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Right Column: Sign In Card OR Booking Form */}
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
                className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Secure Quote Booking</h2>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Signing in helps you securely track your booking history, view quotes, pay invoices, and contact technicians directly.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-secondary/35 p-4 space-y-2.5 text-xs text-text-muted leading-relaxed">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Instant status updates & notifications.</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Secure chat with assigned technicians.</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Downloadable bills & invoice records.</span>
                  </div>
                </div>

                <div>
                  <SignInButton mode="modal">
                    <Button size="lg" className="w-full h-12 text-base font-semibold shadow-xs" data-testid="button-sign-in-quote">
                      Sign in to continue
                    </Button>
                  </SignInButton>
                </div>
              </motion.div>
            ) : (
              
              /* Booking Form Card */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Request a Quote</h2>
                  <p className="text-xs text-text-muted">Fields marked with <span className="text-danger">*</span> are required.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  
                  {/* Service */}
                  <div className="space-y-1.5">
                    <Label htmlFor="service" className="text-xs font-semibold text-foreground">Service <span className="text-danger">*</span></Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger id="service" data-testid="select-service" className="h-10 text-sm">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError msg={validationErrors.service} />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold text-foreground">Street Address <span className="text-danger">*</span></Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/flat number, street name"
                      data-testid="input-address"
                      className="h-10 text-sm rounded-lg"
                    />
                    <FieldError msg={validationErrors.address} />
                  </div>

                  {/* City & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-foreground">City <span className="text-danger">*</span></Label>
                      <Input 
                        id="city" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        data-testid="input-city" 
                        className="h-10 text-sm rounded-lg"
                      />
                      <FieldError msg={validationErrors.city} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-semibold text-foreground">Pincode <span className="text-danger">*</span></Label>
                      <Input
                        id="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="6-digit"
                        maxLength={6}
                        data-testid="input-pincode"
                        className="h-10 text-sm rounded-lg"
                      />
                      <FieldError msg={validationErrors.pincode} />
                    </div>
                  </div>

                  {/* Property Type & Area Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="property-type" className="text-xs font-semibold text-foreground">Property Type</Label>
                      <Select value={propertyType} onValueChange={(v) => setPropertyType(v as "residential" | "commercial")}>
                        <SelectTrigger id="property-type" className="h-10 text-sm rounded-lg">
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
                        className="h-10 text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-xs font-semibold text-foreground">Preferred Date <span className="text-danger">*</span></Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        data-testid="input-date"
                        className="h-10 text-sm rounded-lg"
                      />
                      <FieldError msg={validationErrors.date} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="time-slot" className="text-xs font-semibold text-foreground">Time Slot</Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger id="time-slot" className="h-10 text-sm rounded-lg">
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
                      className="text-sm rounded-lg resize-y"
                    />
                  </div>

                  {/* Emergency Checkbox */}
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="emergency" 
                      checked={emergency}
                      onCheckedChange={(v) => setEmergency(v === true)}
                    />
                    <Label htmlFor="emergency" className="text-xs font-medium text-foreground cursor-pointer">
                      This is an emergency request
                    </Label>
                  </div>

                  {/* Error Message */}
                  {status === "error" && errorMessage && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-fade-in" role="alert">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <Button 
                    type="submit" 
                    disabled={status === "submitting"}
                    className="w-full h-12 text-base font-semibold rounded-lg shadow-sm"
                    data-testid="button-submit-booking"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin inline-block" />
                        Submitting...
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
    </>
  );
}
