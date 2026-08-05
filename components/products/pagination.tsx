"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-14 flex items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-accent disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors",
            p === page ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-accent disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
