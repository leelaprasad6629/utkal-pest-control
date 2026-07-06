import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const { getToken, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const token = await getToken();
      const data = await apiFetch<AppNotification[]>("/notifications", { token });
      setNotifications(data);
    } catch {
      // silently ignore — bell is a non-critical enhancement
    }
  }

  useEffect(() => {
    if (!isSignedIn) return;
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const token = await getToken();
    await apiFetch("/notifications/read-all", { method: "PATCH", token });
    load();
  }

  return (
    <DropdownMenu open={open} onOpenChange={(v) => { setOpen(v); if (v) load(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notification-bell">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 6.5H4.5C4.5 13.5 6 12 6 8Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
              data-testid="button-mark-all-read"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-text-muted">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <DropdownMenuItem key={n._id} asChild className="cursor-pointer">
              <Link
                href={n.relatedBookingId ? `/bookings/${n.relatedBookingId}` : "/dashboard"}
                className={cn("flex flex-col items-start gap-0.5 whitespace-normal py-2", !n.read && "bg-secondary/50")}
              >
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-text-muted">{n.message}</span>
                <span className="text-[10px] text-text-muted/70">{new Date(n.createdAt).toLocaleString()}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
