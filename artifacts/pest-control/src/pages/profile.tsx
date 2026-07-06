import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import type { LocalUser } from "@/lib/types";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<LocalUser>("/me", { token });
        setUser(data);
        setPhone(data.phone ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await apiFetch<LocalUser>("/me", {
        method: "PATCH",
        body: JSON.stringify({ phone }),
        token,
      });
      setUser(updated);
      toast({ title: "Profile updated" });
    } catch (err) {
      toast({ title: "Could not update profile", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (!isSignedIn) {
    return <main className="max-w-lg mx-auto px-4 md:px-6 py-14 text-text-muted">Please sign in to view your profile.</main>;
  }

  if (loading) {
    return <main className="max-w-lg mx-auto px-4 md:px-6 py-14 text-text-muted">Loading profile...</main>;
  }

  return (
    <main className="max-w-lg mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <h1 className="text-primary">My Profile</h1>
      <form className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={user?.name ?? ""} disabled data-testid="input-profile-name" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled data-testid="input-profile-email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            data-testid="input-profile-phone"
          />
        </div>
        <Button type="submit" disabled={saving} data-testid="button-save-profile">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
