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
      className="fixed bottom-4 right-4 z-1000 flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366] p-3 text-white shadow-[0_18px_40px_-18px_rgba(37,211,102,0.75)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 sm:bottom-6 sm:right-6 sm:p-4"
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <span className="hidden pr-1 text-sm font-semibold sm:inline-flex">Chat on WhatsApp</span>
    </motion.a>
  );
}
