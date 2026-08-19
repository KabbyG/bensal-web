"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContactForm } from "@/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setFileName(null);
        setDone(true);
        setTimeout(() => setDone(false), 4500);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="relative rounded-3xl border border-border bg-card p-8 sm:p-10">
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
              <CheckCircle2 className="h-16 w-16 text-accent" />
            </motion.div>
            <p className="font-display text-xl font-semibold">Message sent!</p>
            <p className="text-sm text-muted-foreground">Thank you — we&apos;ll be in touch shortly.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill out the form and our team will respond as soon as possible.
      </p>

      <form ref={formRef} action={handleSubmit} className="mt-8 space-y-5">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" placeholder="Company Ltd." />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="+255 7XX XXX XXX" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" required placeholder="How can we help?" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" required rows={5} placeholder="Tell us more about your request..." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="attachment">
            Attachment <span className="font-normal text-muted-foreground">(optional, max 3MB)</span>
          </Label>
          <label
            htmlFor="attachment"
            className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-4 w-4" />
            {fileName ?? "PDF, DOC, DOCX, PNG, JPG, ZIP, RAR"}
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
