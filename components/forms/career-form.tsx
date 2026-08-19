"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitJobApplication } from "@/actions/career";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Vercel enforces a hard, non-configurable 4.5MB request body limit on
// serverless functions, and next.config.ts caps Server Actions at 4MB to
// stay under it — see the comments there. The career form can submit a CV
// plus several certificates in one request, so unlike the contact form's
// single attachment, per-file validation alone isn't enough: this checks
// the combined size client-side before submitting, so applicants get a
// clear message instead of a raw server error.
const MAX_TOTAL_ATTACHMENT_BYTES = 3.5 * 1024 * 1024;

export function CareerForm({ jobPostingId, jobTitle }: { jobPostingId?: string; jobTitle?: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = React.useState(false);
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [certFiles, setCertFiles] = React.useState<File[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const totalBytes = (cvFile?.size ?? 0) + certFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      toast.error("Your CV and certificates together exceed 3.5MB. Please remove or compress some files.");
      return;
    }

    startTransition(async () => {
      const result = await submitJobApplication(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setCvFile(null);
        setCertFiles([]);
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
              <CheckCircle2 className="h-14 w-14 text-accent" />
            </motion.div>
            <p className="font-display text-lg font-semibold">Application submitted!</p>
            <p className="text-sm text-muted-foreground">We&apos;ll review it and be in touch.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="font-display text-xl font-semibold">
        {jobTitle ? `Apply for ${jobTitle}` : "Submit a General Application"}
      </h3>

      <form ref={formRef} action={handleSubmit} className="mt-6 space-y-4">
        {jobPostingId && <input type="hidden" name="jobPostingId" value={jobPostingId} />}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-fullName">Full name</Label>
            <Input id="c-fullName" name="fullName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-phone">Phone</Label>
            <Input id="c-phone" name="phone" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-coverLetter">Cover letter (optional)</Label>
          <Textarea id="c-coverLetter" name="coverLetter" placeholder="Tell us why you're a great fit..." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c-cv">CV / Resume (PDF, DOC, DOCX — max 3MB)</Label>
          <label
            htmlFor="c-cv"
            className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-4 w-4" />
            {cvFile?.name ?? "Choose file..."}
          </label>
          <input
            id="c-cv"
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c-certs">
            Certificates{" "}
            <span className="font-normal text-muted-foreground">
              (optional, multiple allowed — 3MB each, 3.5MB total with CV)
            </span>
          </Label>
          <label
            htmlFor="c-certs"
            className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-4 w-4" />
            {certFiles.length > 0 ? `${certFiles.length} file(s) selected` : "Choose files..."}
          </label>
          <input
            id="c-certs"
            name="certificates"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => setCertFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        <Button type="submit" variant="accent" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
