import { entityRegistry } from "@/lib/admin/entity-registry";
import { TrashManager, type TrashRow } from "@/components/admin/trash-manager";

export default async function AdminTrashPage() {
  const rows: TrashRow[] = [];

  for (const config of Object.values(entityRegistry)) {
    const deleted = await config.listDeleted();
    for (const row of deleted) {
      rows.push({
        id: row.id,
        entityKey: config.key,
        entityLabel: config.label,
        label: config.rowLabel(row),
        deletedAt: (row.deletedAt as Date).toISOString(),
      });
    }
  }

  rows.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Trash</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Deleted records across every content type. Restore or permanently delete them here.
      </p>
      <div className="mt-6">
        <TrashManager data={rows} />
      </div>
    </div>
  );
}
