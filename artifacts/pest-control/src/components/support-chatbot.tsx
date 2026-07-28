import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Bot,
  User as UserIcon,
  Calendar,
  Shield,
  MapPin,
  Phone,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { WHATSAPP_URL, WHATSAPP_NUMBER } from "@/config/business";

type Role = "user" | "assistant";

interface ChatButton {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  kind: "navigate" | "link" | "phone";
  value: string;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  /** Optional action buttons rendered below the message bubble */
  buttons?: ChatButton[];
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  kind: "navigate" | "response" | "link";
  value: string;
  /** Predefined response text for "response" kind */
  response?: string;
  /** Optional action buttons for the response */
  buttons?: ChatButton[];
}

const WELCOME_TEXT =
  "\uD83D\uDC4B Welcome to Utkal Pest Control.\nHow can I help you today?";

const FALLBACK_REPLY =
  "Sorry, I'm currently unavailable. Please contact us through WhatsApp.";

const PHONE_DISPLAY = "+91 70938 23752";
const PHONE_TEL = "+917093823752";
const EMAIL_1 = "contact@utkalpestcontrol.com";
const EMAIL_2 = "info@utkalpestcontrol.com";
const WORKING_HOURS = "Mon – Sat: 8:00 AM – 8:00 PM\nSunday: Emergency Only";

/** WhatsApp deep link with a pre-filled support message */
const WHATSAPP_SUPPORT_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(
  "Hi, I need help regarding pest control services."
)}`;

/* ── Predefined quick-action responses ─────────────────────────────── */

const PRICING_RESPONSE = [
  "📋 Our Pest Control Service Pricing (Starting Prices):",
  "",
  "1. Cockroach & General Pest Control — ₹999+",
  "2. Mosquito & Fumigation — ₹1,299+",
  "3. Residential Pest Control — ₹1,499+",
  "4. Rodent Control — ₹1,799+",
  "5. Bed Bug Treatment — ₹2,499+",
  "6. Agricultural Pest Advisory — ₹2,500+",
  "7. Commercial Pest Control — ₹4,999+",
  "8. Termite Control — ₹4,999+",
  "",
  "Note: Final pricing depends on inspection and property size. Book a free inspection for an accurate quote!",
].join("\n");

const PRICING_BUTTONS: ChatButton[] = [
  { label: "Book a Service", icon: Calendar, kind: "navigate", value: "/quote" },
];

const CONTACT_RESPONSE = [
  "📞 Contact Support — Utkal Pest Control",
  "",
  `Phone: ${PHONE_DISPLAY}`,
  `WhatsApp: ${PHONE_DISPLAY}`,
  `Email: ${EMAIL_1}`,
  `        ${EMAIL_2}`,
  "Working Hours:",
  WORKING_HOURS,
  "",
  "Tap below to call or chat with us on WhatsApp!",
].join("\n");

const CONTACT_BUTTONS: ChatButton[] = [
  { label: "Call Now", icon: Phone, kind: "phone", value: PHONE_TEL },
  { label: "WhatsApp", icon: FaWhatsapp, kind: "link", value: WHATSAPP_SUPPORT_URL },
  { label: "Visit Contact Page", icon: MessageSquare, kind: "navigate", value: "/contact" },
];

const SERVICE_AREAS_RESPONSE = [
  "📍 Service Areas",
  "",
  "We provide pest control services across India.",
  "Contact us to confirm availability in your area.",
  "",
  `📞 Call us at ${PHONE_DISPLAY} or reach out via WhatsApp for quick confirmation!`,
].join("\n");

const SAFETY_RESPONSE = [
  "🛡️ Safety Information",
  "",
  "Our treatments are safe when instructions are followed.",
  "",
  "• Keep children and pets away during treatment if required.",
  "• Follow the technician's safety instructions carefully.",
  "• Ventilate rooms before reuse when applicable.",
  "",
  "If you have any concerns, our technicians are happy to guide you on-site.",
].join("\n");

const SAFETY_BUTTONS: ChatButton[] = [
  { label: "Book a Service", icon: Calendar, kind: "navigate", value: "/quote" },
];

/* ── Quick-action button definitions ───────────────────────────────── */

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Book a Service", icon: Calendar, kind: "navigate", value: "/quote" },
  { label: "Services", icon: HelpCircle, kind: "navigate", value: "/services" },
  {
    label: "Pricing",
    icon: HelpCircle,
    kind: "response",
    value: "Pricing",
    response: PRICING_RESPONSE,
    buttons: PRICING_BUTTONS,
  },
  {
    label: "Contact Support",
    icon: Phone,
    kind: "response",
    value: "Contact Support",
    response: CONTACT_RESPONSE,
    buttons: CONTACT_BUTTONS,
  },
  {
    label: "Service Areas",
    icon: MapPin,
    kind: "response",
    value: "Service Areas",
    response: SERVICE_AREAS_RESPONSE,
  },
  {
    label: "Safety Information",
    icon: Shield,
    kind: "response",
    value: "Safety Information",
    response: SAFETY_RESPONSE,
    buttons: SAFETY_BUTTONS,
  },
  {
    label: "WhatsApp Support",
    icon: FaWhatsapp,
    kind: "link",
    value: WHATSAPP_SUPPORT_URL,
  },
];

let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return "m" + Date.now() + "_" + idCounter;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return "+91 " + digits.slice(2, 7) + " " + digits.slice(7);
  }
  return PHONE_DISPLAY;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Auto-scroll to the latest message whenever messages, typing state, or
  // open state changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setShowQuickActions(false);
      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      const history = messages;
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error("Chat request failed");
        const data = await res.json();
        const reply =
          (data && typeof data.reply === "string" && data.reply) || FALLBACK_REPLY;
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: reply,
            timestamp: Date.now(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: FALLBACK_REPLY,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      // Link: open external URL (WhatsApp, etc.)
      if (action.kind === "link") {
        window.open(action.value, "_blank", "noopener,noreferrer");
        return;
      }
      // Navigate: close chat and navigate to an internal route
      if (action.kind === "navigate") {
        setIsOpen(false);
        navigate(action.value);
        return;
      }
      // Response: show a predefined assistant message inline (no API call)
      if (action.kind === "response") {
        setShowQuickActions(false);
        const userMsg: ChatMessage = {
          id: makeId(),
          role: "user",
          content: action.value,
          timestamp: Date.now(),
        };
        const botMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          content: action.response || "",
          timestamp: Date.now(),
          buttons: action.buttons,
        };
        setMessages((prev) => [...prev, userMsg, botMsg]);
        return;
      }
    },
    [navigate]
  );

  const handleChatButton = useCallback(
    (btn: ChatButton) => {
      if (btn.kind === "navigate") {
        setIsOpen(false);
        navigate(btn.value);
        return;
      }
      if (btn.kind === "link") {
        window.open(btn.value, "_blank", "noopener,noreferrer");
        return;
      }
      if (btn.kind === "phone") {
        window.location.href = `tel:${btn.value}`;
        return;
      }
    },
    [navigate]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setShowQuickActions(true);
    setIsTyping(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating chat button — sits above the WhatsApp button to avoid overlap */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open support chat"
            className="fixed bottom-20 right-4 z-[1001] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-24 sm:right-6 sm:h-16 sm:w-16"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.span
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }}
              className="flex h-full w-full items-center justify-center"
            >
              <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.span>
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="window"
            role="dialog"
            aria-label="Utkal Pest Control support chat"
            className="fixed bottom-20 right-3 z-[1001] flex h-[70vh] max-h-[36rem] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:bottom-28 sm:right-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Header: logo + title + controls */}
            <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <Logo size={32} className="shrink-0" />
                <div className="leading-tight">
                  <p className="font-display text-sm font-semibold">
                    Utkal Pest Control
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-primary-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300" />
                    Online now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                  className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  title="Close"
                  className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-background px-3 py-4"
            >
              {/* Welcome message */}
              <div className="flex flex-col gap-1">
                <div className="flex items-end gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm text-foreground">
                    {WELCOME_TEXT}
                  </div>
                </div>
                <span className="ml-9 text-[10px] text-muted-foreground">
                  {formatTime(Date.now())}
                </span>
              </div>

              {/* Quick-action buttons (shown until first interaction) */}
              {showQuickActions && (
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => handleQuickAction(action)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Icon className="h-3 w-3" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Conversation messages */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={"flex flex-col gap-1 " + (m.role === "user" ? "items-end" : "items-start")}
                >
                  <div className={"flex items-end gap-2 " + (m.role === "user" ? "flex-row-reverse" : "")}>
                    <span
                      className={
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
                        (m.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary text-primary-foreground")
                      }
                    >
                      {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div
                      className={
                        "max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm " +
                        (m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground")
                      }
                    >
                      {m.content}
                    </div>
                  </div>

                  {/* Action buttons attached to this message */}
                  {m.buttons && m.buttons.length > 0 && (
                    <div className={"flex flex-wrap gap-1.5 " + (m.role === "user" ? "justify-end pr-9" : "pl-9")}>
                      {m.buttons.map((btn) => {
                        const Icon = btn.icon;
                        return (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => handleChatButton(btn)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {Icon && <Icon className="h-3 w-3" />}
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <span
                    className={
                      "text-[10px] text-muted-foreground " +
                      (m.role === "user" ? "mr-9" : "ml-9")
                    }
                  >
                    {formatTime(m.timestamp)}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              )}
            </div>

            {/* Phone footer */}
            <div className="flex items-center justify-center gap-1.5 border-t border-border bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>Call us: {formatPhone(WHATSAPP_NUMBER)}</span>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border bg-card p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                aria-label="Type your message"
                className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
