"use client";

import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  return (
    <motion.a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <FaWhatsapp className="relative h-7 w-7" />
    </motion.a>
  );
}
