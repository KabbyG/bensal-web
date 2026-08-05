"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, FileText } from "lucide-react";
import type { JobApplication, JobPosting } from "@/lib/generated/prisma/client";
import { updateApplicationStatus, softDeleteApplication } from "@/actions/admin/applications";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { StatusSelect } from "@/components/admin/status-select";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const;

type ApplicationWithPosting = JobApplication & { jobPosting: JobPosting | null };

export function ApplicationManager({ data }: { data: ApplicationWithPosting[] }) {
  const router = useRouter();
  const [viewing, setViewing] = React.useState<ApplicationWithPosting | null>(null);

  return (
    <div className="space-y-4">
      <ExportButtons entity="applications" />

      <DataTable
        data={data}
        searchValue={(row) => `${row.fullName} ${row.email} ${row.jobPosting?.title ?? ""}`}
        emptyMessage="No applications yet."
        columns={[
          { key: "fullName", header: "Applicant", sortable: true },
          { key: "jobPosting", header: "Position", render: (r) => r.jobPosting?.title ?? "General application" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <StatusSelect
                id={r.id}
                value={r.status}
                options={STATUSES}
                updateAction={updateApplicationStatus}
                onUpdated={() => router.refresh()}
              />
            ),
          },
          { key: "createdAt", header: "Applied", sortable: true, render: (r) => r.createdAt.toLocaleString() },
        ]}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewing(row)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
              title={`Delete application from "${row.fullName}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteApplication(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} title="Job Application">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Applicant</p>
                <p>{viewing.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Position</p>
                <p>{viewing.jobPosting?.title ?? "General application"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
                <a href={`mailto:${viewing.email}`} className="text-accent hover:underline">
                  {viewing.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
                <p>{viewing.phone}</p>
              </div>
            </div>
            {viewing.coverLetter && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Cover letter</p>
                <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-4">
                  {viewing.coverLetter}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              <a
                href={viewing.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <FileText className="h-4 w-4" /> View CV
              </a>
              {viewing.certificateUrls.map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                  <FileText className="h-4 w-4" /> Certificate {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </EntityDialog>
    </div>
  );
}
