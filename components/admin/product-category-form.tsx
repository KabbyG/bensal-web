"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ProductCategory } from "@/lib/generated/prisma/client";
import { createProductCategory, updateProductCategory } from "@/actions/admin/product-categories";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function ProductCategoryForm({
  category,
  onSaved,
}: {
  category: ProductCategory | null;
  onSaved: () => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState(category?.name ?? "");
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(category));

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = category
        ? await updateProductCategory(category.id, formData)
        : await createProductCategory(formData);
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
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
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
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ""} />
      </div>
      <ImageUploadField name="imageFile" label="Image" defaultUrl={category?.image} />
      <div className="max-w-[160px] space-y-1.5">
        <Label htmlFor="order">Order</Label>
        <Input id="order" name="order" type="number" defaultValue={category?.order ?? 0} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
