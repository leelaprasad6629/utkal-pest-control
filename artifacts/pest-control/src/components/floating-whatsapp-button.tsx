import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { BUSINESS_NAME, WHATSAPP_URL } from "@/config/business";

export default function FloatingWhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${BUSINESS_NAME} on WhatsApp`}
      title={`Chat with ${BUSINESS_NAME} on WhatsApp`}
      className="fixed bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366] p-3 text-white shadow-[0_8px_30px_-8px_rgba(37,211,102,0.6)] transition-all duration-300 hover:shadow-[0_8px_40px_-6px_rgba(37,211,102,0.8)] hover:scale-105 hover:-translate-y-1 sm:bottom-6 sm:right-6 sm:p-4"
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <span className="relative hidden pr-1 text-sm font-semibold sm:inline-flex">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}
