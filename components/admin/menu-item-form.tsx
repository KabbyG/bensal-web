"use client";

import * as React from "react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/generated/prisma/client";
import { createMenuItem, updateMenuItem } from "@/actions/admin/menus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function MenuItemForm({
  menuId,
  item,
  topLevelOptions,
  onSaved,
}: {
  menuId: string;
  item: MenuItem | null;
  topLevelOptions: MenuItem[];
  onSaved: () => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [parentId, setParentId] = React.useState(item?.parentId ?? "none");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = item
        ? await updateMenuItem(item.id, formData)
        : await createMenuItem(menuId, formData);
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
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" required defaultValue={item?.label} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="url">URL</Label>
        <Input id="url" name="url" required placeholder="/about or https://..." defaultValue={item?.url} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="parentId">Parent (for dropdown nesting)</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger id="parentId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top-level)</SelectItem>
            {topLevelOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="parentId" value={parentId === "none" ? "" : parentId} />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="openInNewTab" name="openInNewTab" defaultChecked={item?.openInNewTab ?? false} />
        <Label htmlFor="openInNewTab">Open in new tab</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
