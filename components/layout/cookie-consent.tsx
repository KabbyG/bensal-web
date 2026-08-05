"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bensal-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 shadow-2xl sm:inset-x-auto sm:right-6"
        >
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="flex-1">
              <p className="text-sm text-foreground">
                We use cookies to improve your experience on our site. By continuing, you agree to
                our{" "}
                <a href="/privacy-policy" className="underline hover:text-accent">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="accent" onClick={accept}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
