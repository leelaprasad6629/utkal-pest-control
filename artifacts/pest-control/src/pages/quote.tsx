import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";

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
  return <p className="mt-1 text-xs text-danger" role="alert">{msg}</p>;
}

/** Confirmation card shown after a successful booking submission. */
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
    <div className="max-w-lg rounded-xl border border-border bg-card p-8 shadow-sm text-center animate-fade-in">
      {/* Success icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-success" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 12.5 L11 15.5 L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-primary">Booking Confirmed!</h2>
      <p className="mt-2 text-text-muted text-sm">
        Your request has been received. Our team will confirm the details shortly.
      </p>

      {/* Booking summary */}
      <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4 text-left space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Booking ID</span>
          <span className="font-mono font-semibold text-primary">{bookingNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Service</span>
          <span className="font-medium">{serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Scheduled</span>
          <span className="font-medium">
            {new Date(scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Address</span>
          <span className="font-medium text-right max-w-[180px]">{address}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link href={`/bookings/${bookingId}`} className="flex-1">
          <Button className="w-full" data-testid="button-view-booking">View Booking</Button>
        </Link>
        <Button variant="outline" className="flex-1" onClick={onNewBooking} data-testid="button-new-booking">
          Book Another
        </Button>
      </div>
    </div>
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

  if (!isSignedIn) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center">
          <h1 className="text-primary">Get a Quote / Book Service</h1>
          <p className="mt-3 text-text-muted">Please sign in to request a quote or book a service.</p>
          <div className="mt-6">
            <SignInButton mode="modal">
              <Button size="lg" data-testid="button-sign-in-quote">
                Sign in to continue
              </Button>
            </SignInButton>
          </div>
        </div>
      </main>
    );
  }

  if (status === "done" && confirmedBooking) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in flex justify-center">
        <BookingConfirmation
          bookingId={confirmedBooking.id}
          bookingNumber={confirmedBooking.bookingNumber}
          serviceName={confirmedBooking.serviceName}
          scheduledDate={confirmedBooking.scheduledDate}
          address={confirmedBooking.address}
          onNewBooking={resetForm}
        />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <h1 className="text-primary">Get a Quote / Book Service</h1>
      <p className="mt-3 text-text-muted max-w-lg">
        Tell us a bit about your property and preferred schedule — we'll confirm the details shortly.
      </p>
      <form
        className="mt-8 max-w-lg space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Service */}
        <div className="space-y-1.5">
          <Label htmlFor="service">Service <span className="text-danger">*</span></Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger id="service" data-testid="select-service">
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
          <Label htmlFor="address">Street Address <span className="text-danger">*</span></Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House/flat number, street name"
            data-testid="input-address"
          />
          <FieldError msg={validationErrors.address} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">City <span className="text-danger">*</span></Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} data-testid="input-city" />
            <FieldError msg={validationErrors.city} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode">Pincode <span className="text-danger">*</span></Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="6-digit pincode"
              maxLength={6}
              data-testid="input-pincode"
            />
            <FieldError msg={validationErrors.pincode} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="property-type">Property Type</Label>
            <Select value={propertyType} onValueChange={(v) => setPropertyType(v as "residential" | "commercial")}>
              <SelectTrigger id="property-type" data-testid="select-property-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-size">Area Size (sq ft)</Label>
            <Input
              id="area-size"
              type="number"
              min="0"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              data-testid="input-area-size"
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Preferred Date <span className="text-danger">*</span></Label>
          <Input
            id="date"
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            data-testid="input-date"
          />
          <FieldError msg={validationErrors.date} />
        </div>

        {/* Time slot */}
        <div className="space-y-1.5">
          <Label htmlFor="time-slot">Preferred Time Slot</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger id="time-slot" data-testid="select-time-slot"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00-11:00">9:00 AM – 11:00 AM</SelectItem>
              <SelectItem value="11:00-13:00">11:00 AM – 1:00 PM</SelectItem>
              <SelectItem value="14:00-16:00">2:00 PM – 4:00 PM</SelectItem>
              <SelectItem value="16:00-18:00">4:00 PM – 6:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the pest issue, access instructions, etc."
            data-testid="input-notes"
          />
        </div>

        {/* Emergency */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="emergency"
            checked={emergency}
            onCheckedChange={(v) => setEmergency(Boolean(v))}
            data-testid="checkbox-emergency"
          />
          <Label htmlFor="emergency" className="cursor-pointer">This is an urgent / emergency request</Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={status === "submitting"}
          data-testid="button-request-quote"
        >
          {status === "submitting" ? "Submitting..." : "Request Quote"}
        </Button>

        {status === "error" && (
          <p className="text-sm text-danger" data-testid="text-error">
            {errorMessage ?? "Error creating quote. Try again later."}
          </p>
        )}
      </form>
    </main>
  );
}
