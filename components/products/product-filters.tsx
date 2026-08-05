"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Category = { id: string; slug: string; name: string; _count: { products: number } };

export function ProductFilters({
  categories,
  totalCount,
}: {
  categories: Category[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (searchParams.get("search") ?? "")) {
        updateParams({ search: search || null });
      }
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: null })}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !activeCategory
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border hover:border-accent"
          )}
        >
          All ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams({ category: cat.slug })}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.slug
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border hover:border-accent"
            )}
          >
            {cat.name} ({cat._count.products})
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10"
        />
      </div>
    </div>
  );
}
