"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export default function PointerOverlay() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleMovePointer = (e: CustomEvent) => {
      const { elementId } = e.detail;
      const el = document.getElementById(elementId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Move pointer to the center of the element, adjust for scroll
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
        });
        setActive(true);
        // Highlight the element briefly
        el.classList.add("ring-4", "ring-brand-main", "ring-offset-2", "ring-offset-slate-900", "transition-all", "duration-500");
        setTimeout(() => {
            setActive(false);
            el.classList.remove("ring-4", "ring-brand-main", "ring-offset-2", "ring-offset-slate-900");
        }, 3000); // Hide after 3s
      }
    };

    window.addEventListener("movePointer" as any, handleMovePointer);
    return () => window.removeEventListener("movePointer" as any, handleMovePointer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100, y: -100 }}
      animate={{
        opacity: active ? 1 : 0,
        x: position.x,
        y: position.y,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="pointer-events-none absolute z-[100] flex items-center justify-center text-brand-light drop-shadow-2xl"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      <MousePointer2 size={64} fill="currentColor" strokeWidth={1} />
    </motion.div>
  );
}
