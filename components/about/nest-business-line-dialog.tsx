"use client";

import * as React from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PDF_SRC = "/documents/bensal-nest-business-line.pdf";
const PDF_FILENAME = "Bensal-Nest-Business-Line.pdf";

export function NestBusinessLineDialog({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "font-semibold text-foreground underline decoration-accent/40 decoration-2 underline-offset-4 transition-colors duration-200 hover:text-accent focus-visible:text-accent focus-visible:outline-none",
            className
          )}
        >
          {children}
        </button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0",
          "sm:h-[85vh] sm:w-[95vw] sm:max-w-3xl sm:rounded-3xl"
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLButtonElement>("button:has(.sr-only)")
            ?.focus();
        }}
      >
        <header className="flex items-center gap-3 border-b border-border bg-surface-muted/60 px-5 py-4 pr-14 sm:px-6 sm:pr-16">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-border">
            <Image src="/brand/logo.png" alt="Bensal" fill className="object-cover object-left" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="truncate font-display text-base font-semibold sm:text-lg">
              Bensal Nest Business Line
            </DialogTitle>
            <p className="truncate text-xs text-muted-foreground">
              Approved NEST business line categories
            </p>
          </div>
        </header>

        <div className="reveal-on-hover-group relative min-h-0 flex-1 bg-surface-muted">
          <iframe
            src={`${PDF_SRC}#toolbar=0`}
            title="Bensal Nest Business Line"
            className="h-full w-full border-0"
          />

          <a
            href={PDF_SRC}
            download={PDF_FILENAME}
            className="reveal-on-hover absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-[opacity,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
