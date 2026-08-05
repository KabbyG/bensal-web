"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/newsletter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function StatusSelect({
  id,
  value,
  options,
  updateAction,
  onUpdated,
}: {
  id: string;
  value: string;
  options: readonly string[];
  updateAction: (id: string, status: string) => Promise<ActionResult>;
  onUpdated?: () => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const [current, setCurrent] = React.useState(value);

  function handleChange(next: string) {
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await updateAction(id, next);
      if (result.success) {
        toast.success(result.message);
        onUpdated?.();
      } else {
        toast.error(result.message);
        setCurrent(previous);
      }
    });
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-9 w-[150px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o.charAt(0) + o.slice(1).toLowerCase().replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
