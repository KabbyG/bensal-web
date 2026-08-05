"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type LogoEntity = { id: string; name: string; url: string | null; order: number; logoUrl: string };

export function LogoEntityForm({
  item,
  onSaved,
  createAction,
  updateAction,
}: {
  item: LogoEntity | null;
  onSaved: () => void;
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<ActionResult>;
}) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = item ? await updateAction(item.id, formData) : await createAction(formData);
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={item?.name} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="url">Website URL</Label>
        <Input id="url" name="url" placeholder="https://" defaultValue={item?.url ?? ""} />
      </div>
      <ImageUploadField name="logoUrlFile" label="Logo" defaultUrl={item?.logoUrl} />
      <div className="max-w-[160px] space-y-1.5">
        <Label htmlFor="order">Order</Label>
        <Input id="order" name="order" type="number" defaultValue={item?.order ?? 0} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
