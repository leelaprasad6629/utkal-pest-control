import { useEffect, useState, type FormEvent } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import type { LocalUser } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

function SkeletonLine({ w = "w-40" }: { w?: string }) {
  return <div className={`h-4 rounded bg-muted animate-pulse ${w}`} />;
}

export default function Profile() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [phone, setPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<LocalUser>("/me", { token });
        setUser(data);
        setPhone(data.phone ?? "");
        const addr = data.addresses?.[0];
        if (addr) {
          setAddrLine1(addr.line1 ?? "");
          setAddrCity(addr.city ?? "");
          setAddrState(addr.state ?? "");
          setAddrPincode(addr.pincode ?? "");
          setAddrLandmark(addr.landmark ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn]);

  function validate() {
    const errs: Record<string, string> = {};
    if (phone && !/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      errs.phone = "Phone must be 10 digits";
    }
    if (addrPincode && !/^\d{6}$/.test(addrPincode.trim())) {
      errs.pincode = "Pincode must be 6 digits";
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await apiFetch<LocalUser>("/me", {
        method: "PATCH",
        body: JSON.stringify({
          phone: phone || undefined,
          address: {
            line1: addrLine1 || undefined,
            city: addrCity || undefined,
            state: addrState || undefined,
            pincode: addrPincode || undefined,
            landmark: addrLandmark || undefined,
          },
        }),
        token,
      });
      setUser(updated);
      toast({ title: "Profile updated successfully" });
    } catch (err) {
      toast({ title: "Could not update profile", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (!isSignedIn) {
    return (
      <main className="max-w-lg mx-auto px-4 md:px-6 py-14">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-text-muted">Please sign in to view your profile.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Back to home</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 md:px-6 py-14 space-y-6">
        <SkeletonLine w="w-32" />
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <SkeletonLine w="w-48" />
          <SkeletonLine w="w-64" />
          <SkeletonLine w="w-40" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary">My Profile</h1>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">← Dashboard</Link>
      </div>

      {/* Account identity */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <UserButton />
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
            <p className="text-xs mt-0.5 capitalize text-text-muted/70">{user?.role}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          To change your name, email, or password, use the account menu (avatar icon in the top-right).
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Contact</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                data-testid="input-profile-phone"
              />
              {errors.phone && <p className="text-xs text-danger">{errors.phone}</p>}
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Primary Address</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-line1">Street Address</Label>
              <Input
                id="addr-line1"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                placeholder="House/flat number, street name"
                data-testid="input-profile-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City</Label>
                <Input
                  id="addr-city"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  data-testid="input-profile-city"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-state">State</Label>
                <Input
                  id="addr-state"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="State"
                  data-testid="input-profile-state"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-pincode">Pincode</Label>
                <Input
                  id="addr-pincode"
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value)}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  data-testid="input-profile-pincode"
                />
                {errors.pincode && <p className="text-xs text-danger">{errors.pincode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-landmark">Landmark</Label>
                <Input
                  id="addr-landmark"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                  placeholder="Nearby landmark"
                  data-testid="input-profile-landmark"
                />
              </div>
            </div>
          </div>
        </section>

        <Button type="submit" className="w-full" disabled={saving} data-testid="button-save-profile">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
