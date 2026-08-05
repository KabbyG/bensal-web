"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ProductCategory } from "@/lib/generated/prisma/client";
import { softDeleteProductCategory } from "@/actions/admin/product-categories";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { ProductCategoryForm } from "@/components/admin/product-category-form";
import { Button } from "@/components/ui/button";

type CategoryWithCount = ProductCategory & { _count: { products: number } };

export function ProductCategoryManager({ data }: { data: CategoryWithCount[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductCategory | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: ProductCategory) {
    setEditing(row);
    setDialogOpen(true);
  }
  function onSaved() {
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ExportButtons entity="product-categories" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.name} ${row.slug}`}
        emptyMessage="No product categories yet."
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "slug", header: "Slug", sortable: true },
          { key: "products", header: "Products", render: (r) => String(r._count.products) },
          { key: "order", header: "Order", sortable: true },
        ]}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
              title={`Delete "${row.name}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteProductCategory(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <ProductCategoryForm category={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
