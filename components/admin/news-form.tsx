"use client";

import * as React from "react";
import { toast } from "sonner";
import type { NewsPost } from "@/lib/generated/prisma/client";
import { createNewsPost, updateNewsPost } from "@/actions/admin/news";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { TagInput } from "@/components/admin/tag-input";

export function NewsForm({ post, onSaved }: { post: NewsPost | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();
  const [title, setTitle] = React.useState(post?.title ?? "");
  const [slug, setSlug] = React.useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post));

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = post ? await updateNewsPost(post.id, formData) : await createNewsPost(formData);
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

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" required rows={2} defaultValue={post?.excerpt} />
      </div>

      <RichTextEditor name="content" label="Content" defaultValue={post?.content ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={post?.category ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" defaultValue={post?.author ?? ""} />
        </div>
      </div>

      <TagInput name="tags" label="Tags" defaultValue={post?.tags ?? []} />

      <ImageUploadField name="coverImageFile" label="Cover image" defaultUrl={post?.coverImage} />

      <div className="flex items-center gap-3">
        <Checkbox id="published" name="published" defaultChecked={post?.published ?? false} />
        <Label htmlFor="published">Published</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
