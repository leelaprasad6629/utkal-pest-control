import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

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
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-14 animate-fade-in">
      <h1 className="text-primary">Contact Us</h1>
      <p className="mt-3 text-text-muted max-w-lg">
        Have a question or need a quote? Send us a message and we'll get back to you promptly.
      </p>

      <form
        className="mt-8 max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="input-phone" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            data-testid="input-message"
          />
        </div>
        <Button type="submit" disabled={status === "sending"} className="w-full" data-testid="button-send-message">
          {status === "sending" ? "Sending..." : "Send Message"}
        </Button>
        {status === "sent" && (
          <p className="text-sm text-success" data-testid="text-sent-confirmation">
            Message sent — we'll contact you soon.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-danger" data-testid="text-error">
            Error sending message. Please try again later.
          </p>
        )}
      </form>
    </main>
  );
}
