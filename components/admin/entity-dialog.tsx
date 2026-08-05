"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function EntityDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] max-w-2xl overflow-y-auto", className)}>
        <DialogTitle>{title}</DialogTitle>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
