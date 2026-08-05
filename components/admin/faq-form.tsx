"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Faq } from "@/lib/generated/prisma/client";
import { createFaq, updateFaq } from "@/actions/admin/faqs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function FaqForm({ faq, onSaved }: { faq: Faq | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = faq ? await updateFaq(faq.id, formData) : await createFaq(formData);
      if (result.success) {
        toast.success(result.message);
        onSaved();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="question">Question</Label>
        <Input id="question" name="question" required defaultValue={faq?.question} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="answer">Answer</Label>
        <Textarea id="answer" name="answer" required rows={4} defaultValue={faq?.answer} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={faq?.category ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Order</Label>
          <Input id="order" name="order" type="number" defaultValue={faq?.order ?? 0} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
