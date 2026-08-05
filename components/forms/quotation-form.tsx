"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitQuotationRequest } from "@/actions/quotation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function QuotationForm({ presetItem }: { presetItem: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitQuotationRequest(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setDone(true);
        setTimeout(() => setDone(false), 4000);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="relative rounded-3xl border border-border bg-card p-8">
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <CheckCircle2 className="h-14 w-14 text-accent" />
            </motion.div>
            <p className="font-display text-lg font-semibold">Request sent!</p>
            <p className="text-sm text-muted-foreground">We&apos;ll be in touch shortly.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="font-display text-xl font-semibold">Request a Quotation</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what you need — we&apos;ll respond with pricing and availability.
      </p>

      <form ref={formRef} action={handleSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="productOrService" value={presetItem} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px]"
          aria-hidden
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="q-fullName">Full name</Label>
            <Input id="q-fullName" name="fullName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-company">Company</Label>
            <Input id="q-company" name="company" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="q-email">Email</Label>
            <Input id="q-email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-phone">Phone</Label>
            <Input id="q-phone" name="phone" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="q-details">Details</Label>
          <Textarea id="q-details" name="details" required placeholder={`I'm interested in ${presetItem}...`} />
        </div>
        <Button type="submit" variant="accent" className="w-full" disabled={pending}>
          {pending ? "Sending..." : "Send Request"}
        </Button>
      </form>
    </div>
  );
}
