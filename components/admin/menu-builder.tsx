"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { MenuItem } from "@/lib/generated/prisma/client";
import { deleteMenuItem, reorderMenuItems } from "@/actions/admin/menus";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { Button } from "@/components/ui/button";

type MenuWithItems = { id: string; key: string; label: string; items: MenuItem[] };

function ChildRow({ item, onEdit }: { item: MenuItem; onEdit: () => void }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2">
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.url}</p>
      </div>
      {item.openInNewTab && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
        title={`Delete "${item.label}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          const result = await deleteMenuItem(item.id);
          if (result.success) router.refresh();
          return result;
        }}
      />
    </div>
  );
}

function MenuItemRow({
  item,
  childItems,
  onEdit,
  onEditChild,
}: {
  item: MenuItem;
  childItems: MenuItem[];
  onEdit: () => void;
  onEditChild: (child: MenuItem) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const childSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = childItems.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const result = await reorderMenuItems(arrayMove(ids, oldIndex, newIndex));
    if (result.success) router.refresh();
    else toast.error(result.message);
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground" aria-label="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.url}</p>
        </div>
        {item.openInNewTab && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          }
          title={`Delete "${item.label}"?`}
          description={childItems.length > 0 ? `This also deletes ${childItems.length} sub-item(s).` : undefined}
          confirmLabel="Delete"
          destructive
          onConfirm={async () => {
            const result = await deleteMenuItem(item.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      </div>

      {childItems.length > 0 && (
        <DndContext sensors={childSensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
          <SortableContext items={childItems.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="ml-8 mt-3 space-y-2 border-l border-dashed border-border pl-4">
              {childItems.map((child) => (
                <ChildRow key={child.id} item={child} onEdit={() => onEditChild(child)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export function MenuBuilder({ menus }: { menus: MenuWithItems[] }) {
  const router = useRouter();
  const [activeKey, setActiveKey] = React.useState(menus[0]?.key ?? "");
  const menu = menus.find((m) => m.key === activeKey) ?? menus[0];

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MenuItem | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (!menu) return <p className="text-sm text-muted-foreground">No menus found.</p>;

  const topLevel = menu.items.filter((i) => !i.parentId).sort((a, b) => a.order - b.order);
  const childrenOf = (parentId: string) =>
    menu.items.filter((i) => i.parentId === parentId).sort((a, b) => a.order - b.order);

  async function handleTopDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = topLevel.map((i) => i.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const result = await reorderMenuItems(arrayMove(ids, oldIndex, newIndex));
    if (result.success) router.refresh();
    else toast.error(result.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {menus.map((m) => (
          <Button
            key={m.key}
            variant={m.key === activeKey ? "accent" : "outline"}
            size="sm"
            onClick={() => setActiveKey(m.key)}
          >
            {m.label}
          </Button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopDragEnd}>
        <SortableContext items={topLevel.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {topLevel.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                childItems={childrenOf(item.id)}
                onEdit={() => {
                  setEditing(item);
                  setDialogOpen(true);
                }}
                onEditChild={(child) => {
                  setEditing(child);
                  setDialogOpen(true);
                }}
              />
            ))}
            {topLevel.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
          </div>
        </SortableContext>
      </DndContext>

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Menu Item" : "Add Menu Item"}
      >
        <MenuItemForm
          menuId={menu.id}
          item={editing}
          topLevelOptions={topLevel.filter((i) => i.id !== editing?.id)}
          onSaved={() => {
            setDialogOpen(false);
            router.refresh();
          }}
        />
      </EntityDialog>
    </div>
  );
}
