"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Project } from "@/lib/generated/prisma/client";
import { createProject, updateProject } from "@/actions/admin/projects";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";

export function ProjectForm({ project, onSaved }: { project: Project | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();
  const [title, setTitle] = React.useState(project?.title ?? "");
  const [slug, setSlug] = React.useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(project));
  const [status, setStatus] = React.useState(project?.status ?? "COMPLETED");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = project ? await updateProject(project.id, formData) : await createProject(formData);
      if (result.success) {
        toast.success(result.message);
        onSaved();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" required defaultValue={project?.category} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client">Client</Label>
          <Input id="client" name="client" defaultValue={project?.client ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={project?.location ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" defaultValue={project?.year ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "ONGOING" | "COMPLETED")}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" required rows={2} defaultValue={project?.summary} />
      </div>

      <RichTextEditor name="description" label="Full description" defaultValue={project?.description ?? ""} />

      <ImageUploadField name="coverImageFile" label="Cover image" defaultUrl={project?.coverImage} />
      <MultiImageUpload name="images" label="Gallery images" defaultUrls={project?.images ?? []} />

      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
