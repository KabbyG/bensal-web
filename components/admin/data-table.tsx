"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchValue,
  searchPlaceholder = "Search...",
  actions,
  emptyMessage = "Nothing here yet.",
  pageSize = 10,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  searchValue?: (row: T) => string;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    if (!query.trim() || !searchValue) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) => searchValue(row).toLowerCase().includes(q));
  }, [data, query, searchValue]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const getVal =
      col.sortValue ??
      ((row: T) => String((row as unknown as Record<string, unknown>)[col.key] ?? ""));
    return [...filtered].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {searchValue && (
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className={`whitespace-nowrap px-4 py-3 font-medium ${col.className ?? ""}`}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {actions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                    {col.render
                      ? col.render(row)
                      : String((row as unknown as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages} · {sorted.length} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
