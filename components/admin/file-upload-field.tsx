"use client";

import * as React from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FileUploadField({
  name,
  label,
  accept,
  defaultUrl,
  defaultName,
}: {
  name: string;
  label: string;
  accept: string;
  defaultUrl?: string | null;
  defaultName?: string | null;
}) {
  const [url, setUrl] = React.useState<string | null>(defaultUrl ?? null);
  const [fileName, setFileName] = React.useState<string | null>(defaultName ?? null);
  const [removed, setRemoved] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {url && !removed ? (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-accent">
            <FileText className="h-7 w-7" />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          {url && !removed && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-accent hover:underline"
            >
              {fileName ?? "View current file"}
            </a>
          )}
          <Input
            type="file"
            name={name}
            accept={accept}
            className="h-auto py-2 text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUrl(URL.createObjectURL(file));
                setFileName(file.name);
                setRemoved(false);
              }
            }}
          />
          {url && !removed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                setUrl(null);
                setFileName(null);
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
