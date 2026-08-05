"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";

export function BackToTop() {
  const [visible, setVisible] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 600);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
