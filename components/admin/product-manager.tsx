"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product, ProductCategory } from "@/lib/generated/prisma/client";
import { softDeleteProduct } from "@/actions/admin/products";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/status-badge";

type ProductWithCategory = Product & { category: ProductCategory };

export function ProductManager({
  data,
  categories,
}: {
  data: ProductWithCategory[];
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: Product) {
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
        <ExportButtons entity="products" />
        <Button onClick={openCreate} disabled={categories.length === 0}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a product category first before creating products.
        </p>
      )}

      <DataTable
        data={data}
        searchValue={(row) => `${row.name} ${row.slug} ${row.sku ?? ""}`}
        emptyMessage="No products yet."
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "category", header: "Category", render: (r) => r.category.name },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "isFeatured",
            header: "Featured",
            render: (r) => (r.isFeatured ? <Badge variant="accent">Featured</Badge> : "—"),
          },
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
                const result = await softDeleteProduct(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Product" : "Add Product"}>
        <ProductForm product={editing} categories={categories} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
