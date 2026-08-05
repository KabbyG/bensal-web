"use client";

import * as React from "react";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageUploadField({
  name,
  label,
  defaultUrl,
}: {
  name: string;
  label: string;
  defaultUrl?: string | null;
}) {
  const [preview, setPreview] = React.useState<string | null>(defaultUrl ?? null);
  const [removed, setRemoved] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview && !removed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-20 w-20 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Input
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="h-auto py-2 text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setRemoved(false);
              }
            }}
          />
          {preview && !removed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                setPreview(null);
                setRemoved(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      </div>
      <input type="hidden" name={`${name}Remove`} value={removed ? "true" : "false"} />
    </div>
  );
}
