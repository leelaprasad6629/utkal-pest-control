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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { WHATSAPP_URL, WHATSAPP_NUMBER } from "@/config/business";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  kind: "navigate" | "message" | "link";
  value: string;
}

const WELCOME_TEXT =
  "\uD83D\uDC4B Welcome to Utkal Pest Control.\nHow can I help you today?";

const FALLBACK_REPLY =
  "Sorry, I'm currently unavailable. Please contact us through WhatsApp.";

const PHONE_DISPLAY = "+91 70938 23752";

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

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Book a Service", icon: Calendar, kind: "navigate", value: "/quote" },
  { label: "Services", icon: HelpCircle, kind: "navigate", value: "/services" },
  {
    label: "Pricing",
    icon: HelpCircle,
    kind: "message",
    value: "What are your service charges and pricing?",
  },
  { label: "Contact Support", icon: Phone, kind: "navigate", value: "/contact" },
  {
    label: "Service Areas",
    icon: MapPin,
    kind: "message",
    value: "Which areas do you provide pest control services in?",
  },
  {
    label: "Safety Information",
    icon: Shield,
    kind: "message",
    value: "Is your pest control treatment safe for children and pets?",
  },
  { label: "WhatsApp Support", icon: FaWhatsapp, kind: "link", value: WHATSAPP_URL },
];

let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return "m" + Date.now() + "_" + idCounter;
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
      if (action.kind === "link") {
        window.open(action.value, "_blank", "noopener,noreferrer");
        return;
      }
      if (action.kind === "navigate") {
        setIsOpen(false);
        navigate(action.value);
        return;
      }
      sendMessage(action.value);
    },
    [navigate, sendMessage]
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

              {/* Quick action buttons */}
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
