"use client";

import * as React from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import type { GalleryItem } from "@/lib/generated/prisma/client";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <Dialog>
            <DialogTrigger asChild>
              <button className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-surface-muted">
                <Image
                  src={item.thumbnailUrl ?? item.url}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {item.type === "VIDEO" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <PlayCircle className="h-10 w-10 text-white" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-medium text-white">{item.title}</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-2">
              <DialogTitle className="sr-only">{item.title}</DialogTitle>
              {item.type === "VIDEO" ? (
                <video src={item.url} controls className="max-h-[75vh] w-full rounded-xl" />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <Image src={item.url} alt={item.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-contain" />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
