"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function ToolbarButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
        active && "bg-surface-muted text-accent"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label?: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = React.useState(defaultValue);

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-4 py-3 text-sm outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2",
      },
    },
  });

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
