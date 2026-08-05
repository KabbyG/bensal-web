"use client";

import * as React from "react";
import { toast } from "sonner";
import type { JobPosting } from "@/lib/generated/prisma/client";
import { createJobPosting, updateJobPosting } from "@/actions/admin/careers";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;

export function JobPostingForm({ posting, onSaved }: { posting: JobPosting | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();
  const [title, setTitle] = React.useState(posting?.title ?? "");
  const [slug, setSlug] = React.useState(posting?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(posting));
  const [type, setType] = React.useState(posting?.type ?? "FULL_TIME");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = posting
        ? await updateJobPosting(posting.id, formData)
        : await createJobPosting(formData);
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
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={posting?.department ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required defaultValue={posting?.location} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as (typeof JOB_TYPES)[number])}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={4} defaultValue={posting?.description} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea id="requirements" name="requirements" required rows={4} defaultValue={posting?.requirements} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="closingDate">Closing date</Label>
          <Input
            id="closingDate"
            name="closingDate"
            type="date"
            defaultValue={posting?.closingDate ? posting.closingDate.toISOString().slice(0, 10) : ""}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Checkbox id="isActive" name="isActive" defaultChecked={posting?.isActive ?? true} />
          <Label htmlFor="isActive">Active</Label>
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
