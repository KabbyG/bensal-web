"use client";

import * as React from "react";
import { toast } from "sonner";
import type { SeoMeta } from "@/lib/generated/prisma/client";
import { createSeoMeta, updateSeoMeta } from "@/actions/admin/seo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function SeoForm({ entry, onSaved }: { entry: SeoMeta | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = entry ? await updateSeoMeta(entry.id, formData) : await createSeoMeta(formData);
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
        <Label htmlFor="page">Page key</Label>
        <Input id="page" name="page" required placeholder="home, about, services..." defaultValue={entry?.page} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">SEO title</Label>
        <Input id="title" name="title" defaultValue={entry?.title ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">SEO description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={entry?.description ?? ""} />
      </div>
      <ImageUploadField name="ogImageFile" label="Social share image (OG image)" defaultUrl={entry?.ogImage} />
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
