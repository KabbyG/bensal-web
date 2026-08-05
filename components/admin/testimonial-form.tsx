"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Testimonial } from "@/lib/generated/prisma/client";
import { createTestimonial, updateTestimonial } from "@/actions/admin/testimonials";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function TestimonialForm({
  testimonial,
  onSaved,
}: {
  testimonial: Testimonial | null;
  onSaved: () => void;
}) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = testimonial
        ? await updateTestimonial(testimonial.id, formData)
        : await createTestimonial(formData);
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={testimonial?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={testimonial?.company ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" defaultValue={testimonial?.role ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={4} defaultValue={testimonial?.message} />
      </div>
      <ImageUploadField name="avatarUrlFile" label="Avatar" defaultUrl={testimonial?.avatarUrl} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="max-w-[160px] space-y-1.5">
          <Label htmlFor="order">Order</Label>
          <Input id="order" name="order" type="number" defaultValue={testimonial?.order ?? 0} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Checkbox id="published" name="published" defaultChecked={testimonial?.published ?? true} />
          <Label htmlFor="published">Published</Label>
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
