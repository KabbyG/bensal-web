"use client";

import * as React from "react";
import { useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/actions/newsletter";

export function NewsletterForm() {
  const [pending, startTransition] = useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await subscribeToNewsletter(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        className="h-11 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={pending}
        aria-label="Subscribe"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
