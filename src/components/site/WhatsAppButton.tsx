import { MessageCircle } from "lucide-react";
import { waLink, SITE } from "@/lib/site";
import { motion } from "framer-motion";

export function WhatsAppFloating() {
  return (
    <motion.a
      href={waLink(`Hello ${SITE.name}, I'd like to know more about your tours.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl ring-4 ring-[#25D366]/20"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="relative h-7 w-7" />
    </motion.a>
  );
}
