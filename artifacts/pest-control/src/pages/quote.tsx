import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";

export default function Quote() {
  const { isSignedIn, getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00-11:00");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(console.error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const token = await getToken();
      const payload = {
        serviceId,
        address: { line1: address, city, pincode },
        scheduledDate: new Date(date).toISOString(),
        timeSlot,
      };
      const booking = await apiFetch<{ _id: string }>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      });
      setStatus("done");
      setLocation("/dashboard");
      void booking;
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to create quote. Please try again.");
    }
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

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <h1 className="text-primary">Get a Quote / Book Service</h1>
      <p className="mt-3 text-text-muted max-w-lg">
        Tell us a bit about your property and preferred schedule — we'll confirm the details shortly.
      </p>
      <form
        className="mt-8 max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <Select value={serviceId} onValueChange={setServiceId} required>
            <SelectTrigger id="service" data-testid="select-service">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required data-testid="input-address" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required data-testid="input-city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required data-testid="input-pincode" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            required
            data-testid="input-date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-slot">Preferred Time Slot</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger id="time-slot" data-testid="select-time-slot">
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
        <Button
          type="submit"
          className="w-full"
          disabled={status === "submitting" || !serviceId || !address || !city || !pincode || !date}
          data-testid="button-request-quote"
        >
          {status === "submitting" ? "Submitting..." : "Request Quote"}
        </Button>
        {(!serviceId || !address || !city || !pincode || !date) && (
          <p className="text-xs text-text-muted">Fill in service, address, city, pincode, and date to continue.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-danger" data-testid="text-error">
            {errorMessage ?? "Error creating quote. Try again later."}
          </p>
        )}
      </form>
    </main>
  );
}
