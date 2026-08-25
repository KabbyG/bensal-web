"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Service } from "@/lib/generated/prisma/client";
import { createService, updateService } from "@/actions/admin/services";
import { slugify } from "@/lib/utils";
import { iconMap } from "@/lib/icon-map";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { TagInput } from "@/components/admin/tag-input";

export function ServiceForm({ service, onSaved }: { service: Service | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();
  const [title, setTitle] = React.useState(service?.title ?? "");
  const [slug, setSlug] = React.useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(service));
  const [icon, setIcon] = React.useState(service?.icon ?? "Sparkles");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = service
        ? await updateService(service.id, formData)
        : await createService(formData);
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

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea id="shortDescription" name="shortDescription" required rows={2} defaultValue={service?.shortDescription} />
      </div>

      <RichTextEditor name="description" label="Full description" defaultValue={service?.description ?? ""} />

      <div className="space-y-1.5">
        <TagInput
          name="items"
          label="Items"
          defaultValue={service?.items ?? []}
          placeholder="Type an item and press Enter"
        />
        <p className="text-xs text-muted-foreground">
          Shown as a checklist on the public service page. Add as many as you need.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger id="icon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(iconMap).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="icon" value={icon} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Order</Label>
          <Input id="order" name="order" type="number" defaultValue={service?.order ?? 0} />
        </div>
      </div>

      <ImageUploadField name="imageFile" label="Cover image" defaultUrl={service?.image} />

      <div className="flex items-center gap-3">
        <Checkbox id="isFeatured" name="isFeatured" defaultChecked={service?.isFeatured ?? true} />
        <Label htmlFor="isFeatured">Featured on homepage</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={service?.seoTitle ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={service?.seoDescription ?? ""} />
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
