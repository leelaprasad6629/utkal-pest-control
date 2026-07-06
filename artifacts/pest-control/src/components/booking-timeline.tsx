import type { BookingStatusHistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function BookingTimeline({ history }: { history: BookingStatusHistoryEntry[] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-text-muted">No status history yet.</p>;
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  );

  return (
    <ol className="relative border-l-2 border-border pl-5 space-y-6">
      {sorted.map((entry, idx) => {
        const isLast = idx === sorted.length - 1;
        return (
          <li key={`${entry.status}-${entry.changedAt}-${idx}`} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card",
                isLast ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            <p className="text-sm font-semibold capitalize text-foreground">{entry.status.replace("-", " ")}</p>
            {entry.note && <p className="text-sm text-text-muted mt-0.5">{entry.note}</p>}
            <p className="text-xs text-text-muted/80 mt-0.5">
              {new Date(entry.changedAt).toLocaleString()}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
