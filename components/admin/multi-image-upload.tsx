"use client";

import * as React from "react";
import { X, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

/**
 * Multi-file image field backed by a single hidden <input type="file" multiple>.
 * Re-selecting files replaces a native file input's FileList, so newly picked
 * files are merged into the existing selection via DataTransfer rather than
 * just refreshing the preview — otherwise only the last batch would submit.
 */
export function MultiImageUpload({
  name,
  label,
  defaultUrls = [],
}: {
  name: string;
  label: string;
  defaultUrls?: string[];
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [existing, setExisting] = React.useState<string[]>(defaultUrls);
  const [files, setFiles] = React.useState<File[]>([]);

  function syncInput(nextFiles: File[]) {
    const dt = new DataTransfer();
    nextFiles.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
    setFiles(nextFiles);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-3">
        {existing.map((url) => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setExisting((u) => u.filter((x) => x !== url))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
            <input type="hidden" name={`${name}Keep`} value={url} />
          </div>
        ))}
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => syncInput(files.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground hover:bg-surface-muted">
          <Upload className="h-5 w-5" />
          <span className="text-[10px]">Add</span>
          <input
            ref={inputRef}
            type="file"
            name={name}
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              syncInput([...files, ...picked]);
            }}
          />
        </label>
      </div>
    </div>
  );
}
