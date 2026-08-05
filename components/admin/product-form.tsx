"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Product, ProductCategory } from "@/lib/generated/prisma/client";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";

export function ProductForm({
  product,
  categories,
  onSaved,
}: {
  product: Product | null;
  categories: ProductCategory[];
  onSaved: () => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState(product?.name ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(product));
  const [categoryId, setCategoryId] = React.useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = React.useState(product?.status ?? "PUBLISHED");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = product ? await updateProduct(product.id, formData) : await createProduct(formData);
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="categoryId" value={categoryId} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea id="shortDescription" name="shortDescription" required rows={2} defaultValue={product?.shortDescription} />
      </div>

      <RichTextEditor name="description" label="Full description" defaultValue={product?.description ?? ""} />

      <MultiImageUpload name="images" label="Images" defaultUrls={product?.images ?? []} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Checkbox id="isFeatured" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
          <Label htmlFor="isFeatured">Featured</Label>
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
