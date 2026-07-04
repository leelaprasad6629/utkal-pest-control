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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary">Get a Quote / Book Service</h1>
        <p className="mt-2 text-gray-700">Please sign in to request a quote or book a service.</p>
        <div className="mt-4">
          <SignInButton mode="modal">
            <Button data-testid="button-sign-in-quote">Sign in to continue</Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Get a Quote / Book Service</h1>
      <form className="mt-4 max-w-md space-y-4" onSubmit={handleSubmit}>
        <div>
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
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required data-testid="input-address" />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required data-testid="input-pincode" />
        </div>
        <div>
          <Label htmlFor="date">Preferred Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-date" />
        </div>
        <Button type="submit" disabled={status === "submitting" || !serviceId} data-testid="button-request-quote">
          {status === "submitting" ? "Submitting..." : "Request Quote"}
        </Button>
        {status === "error" && (
          <p className="text-red-600" data-testid="text-error">
            Error creating quote. Try again later.
          </p>
        )}
      </form>
    </main>
  );
}
