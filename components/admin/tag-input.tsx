"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

export function TagInput({
  name,
  label,
  defaultValue = [],
  placeholder = "Type and press Enter",
}: {
  name: string;
  label?: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = React.useState<string[]>(defaultValue);
  const [draft, setDraft] = React.useState("");

  function addTag() {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      setTags((t) => [...t, value]);
    }
    setDraft("");
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs"
          >
            {tag}
            <button type="button" onClick={() => setTags((t) => t.filter((x) => x !== tag))}>
              <X className="h-3 w-3" />
            </button>
            <input type="hidden" name={name} value={tag} />
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            } else if (e.key === "Backspace" && !draft && tags.length) {
              setTags((t) => t.slice(0, -1));
            }
          }}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}
