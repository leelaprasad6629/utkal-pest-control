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
  const [pincode, setPincode] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  useEffect(() => {
    apiFetch<ServiceItem[]>("/services").then(setServices).catch(console.error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const token = await getToken();
      const payload = {
        serviceId,
        address: { line1: address, city: "", pincode },
        scheduledDate: date ? new Date(date).toISOString() : undefined,
        timeSlot: "09:00-11:00",
      };
      const booking = await apiFetch<{ _id: string }>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
        token,
      });
      setStatus("done");
      setLocation("/dashboard");
      void booking;
    } catch {
      setStatus("error");
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
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required data-testid="input-pincode" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-date" />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={status === "submitting" || !serviceId || !address || !pincode}
          data-testid="button-request-quote"
        >
          {status === "submitting" ? "Submitting..." : "Request Quote"}
        </Button>
        {!serviceId && (
          <p className="text-xs text-text-muted">Select a service, address, and pincode to continue.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-danger" data-testid="text-error">
            Error creating quote. Try again later.
          </p>
        )}
      </form>
    </main>
  );
}
