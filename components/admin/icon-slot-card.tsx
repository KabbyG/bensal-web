"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import type { Service } from "@/lib/generated/prisma/client";
import { updateServiceIcon } from "@/actions/admin/icons";
import { ServiceIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IconSlotCard({ service }: { service: Service }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [preview, setPreview] = React.useState<string | null>(service.customIconUrl);
  const [hasSelection, setHasSelection] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await updateServiceIcon(service.id, formData);
      if (result.success) {
        toast.success(result.message);
        setHasSelection(false);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        toast.error(result.message);
        setPreview(service.customIconUrl);
      }
    });
  }

  function handleReset() {
    const formData = new FormData();
    formData.set("iconFileRemove", "true");
    startTransition(async () => {
      const result = await updateServiceIcon(service.id, formData);
      if (result.success) {
        toast.success(result.message);
        setPreview(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <ServiceIcon icon={service.icon} customIconUrl={preview} className="h-8 w-8" />
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <p className="font-display text-sm font-semibold">{service.title}</p>
          <p className="text-xs text-muted-foreground">
            {service.customIconUrl ? "Custom uploaded icon" : `Default icon: ${service.icon}`}
          </p>
        </div>

        <form action={handleUpload} className="flex flex-wrap items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            name="iconFile"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="h-auto max-w-[240px] py-1.5 text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setHasSelection(true);
              }
            }}
          />
          <Button type="submit" size="sm" variant="accent" disabled={pending || !hasSelection}>
            <Upload className="h-3.5 w-3.5" /> Save
          </Button>
          {service.customIconUrl && (
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleReset}>
              <Trash2 className="h-3.5 w-3.5" /> Reset to default
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
