"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<{ success: boolean; message: string } | void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            className={cn(destructive && "border-red-300 text-red-600 hover:bg-red-50")}
            onClick={() => {
              startTransition(async () => {
                const result = await onConfirm();
                if (result && !result.success) {
                  toast.error(result.message);
                  return;
                }
                if (result?.message) toast.success(result.message);
                setOpen(false);
              });
            }}
          >
            {pending ? "Working..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
