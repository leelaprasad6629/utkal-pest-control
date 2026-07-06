import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { Booking, Invoice, PersonRef, ServiceItem } from "@/lib/types";
import { BUSINESS_NAME } from "@/config/business";

export default function InvoiceDetail() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<Invoice>(`/invoices/${params.id}`, { token });
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return <main className="max-w-3xl mx-auto px-4 md:px-6 py-14 text-text-muted">Loading invoice...</main>;
  }

  if (error || !invoice) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-14">
        <p className="text-danger" data-testid="text-error">{error ?? "Invoice not found"}</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">Back to dashboard</Link>
      </main>
    );
  }

  const booking = typeof invoice.bookingId === "object" ? (invoice.bookingId as Booking) : undefined;
  const customer = typeof invoice.customerId === "object" ? (invoice.customerId as PersonRef) : undefined;
  const service = booking && typeof booking.serviceId === "object" ? (booking.serviceId as ServiceItem) : undefined;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-14 animate-fade-in print:py-0">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">← Back to dashboard</Link>
        <Button onClick={() => window.print()} data-testid="button-print-invoice">Download / Print</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-10 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-border pb-6 mb-6">
          <div>
            <h2 className="text-primary">{BUSINESS_NAME}</h2>
            <p className="text-sm text-text-muted mt-1">Invoice</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-text-muted">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
            <p className={`text-sm font-semibold mt-1 capitalize ${invoice.status === "paid" ? "text-success" : "text-warning"}`}>
              {invoice.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-text-muted uppercase text-xs tracking-wide mb-1">Billed to</p>
            <p className="font-medium">{customer?.name ?? "—"}</p>
            <p className="text-text-muted">{customer?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-text-muted uppercase text-xs tracking-wide mb-1">Booking</p>
            <p className="font-medium">{booking?.bookingNumber ?? "—"}</p>
            <p className="text-text-muted">{service?.name ?? "—"}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className="py-3">{service?.name ?? "Pest control service"}</td>
              <td className="py-3 text-right">₹{invoice.amount.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-3">GST (18%)</td>
              <td className="py-3 text-right">₹{invoice.tax.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 font-semibold">Total</td>
              <td className="py-3 text-right font-semibold text-lg">₹{invoice.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-text-muted">Thank you for choosing {BUSINESS_NAME}.</p>
      </div>
    </main>
  );
}
