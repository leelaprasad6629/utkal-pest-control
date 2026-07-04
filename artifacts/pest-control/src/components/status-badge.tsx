import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";

const STATUS_STYLES: Record<Booking["status"], string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-success/15 text-success",
  "en-route": "bg-accent/25 text-accent-foreground",
  "in-progress": "bg-accent/25 text-accent-foreground",
  completed: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

export default function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
