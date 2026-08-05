"use client";

import * as React from "react";
import { toast } from "sonner";
import type { GalleryItem } from "@/lib/generated/prisma/client";
import { createGalleryItem, updateGalleryItem } from "@/actions/admin/gallery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function GalleryForm({ item, onSaved }: { item: GalleryItem | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState<"IMAGE" | "VIDEO">(item?.type ?? "IMAGE");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = item ? await updateGalleryItem(item.id, formData) : await createGalleryItem(formData);
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
          <Input id="title" name="title" required defaultValue={item?.title} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={item?.category ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "IMAGE" | "VIDEO")}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMAGE">Image</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Order</Label>
          <Input id="order" name="order" type="number" defaultValue={item?.order ?? 0} />
        </div>
      </div>

      {type === "IMAGE" ? (
        <ImageUploadField
          name="urlFile"
          label="Image"
          defaultUrl={item?.type === "IMAGE" ? item.url : null}
        />
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="urlText">Video URL</Label>
            <Input
              id="urlText"
              name="urlText"
              placeholder="https://youtube.com/watch?v=..."
              defaultValue={item?.type === "VIDEO" ? item.url : ""}
            />
          </div>
          <ImageUploadField name="thumbnailUrlFile" label="Thumbnail" defaultUrl={item?.thumbnailUrl} />
        </>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
