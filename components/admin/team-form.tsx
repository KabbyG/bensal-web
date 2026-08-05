"use client";

import * as React from "react";
import { toast } from "sonner";
import type { TeamMember } from "@/lib/generated/prisma/client";
import { createTeamMember, updateTeamMember } from "@/actions/admin/team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function TeamForm({ member, onSaved }: { member: TeamMember | null; onSaved: () => void }) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = member
        ? await updateTeamMember(member.id, formData)
        : await createTeamMember(formData);
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={member?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={member?.title} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={member?.bio ?? ""} rows={4} />
      </div>
      <ImageUploadField name="photoFile" label="Photo" defaultUrl={member?.photoUrl} />
      <div className="flex items-center gap-3">
        <Checkbox id="isLeadership" name="isLeadership" defaultChecked={member?.isLeadership} />
        <Label htmlFor="isLeadership">Show in leadership section</Label>
      </div>
      <div className="max-w-[160px] space-y-1.5">
        <Label htmlFor="order">Order</Label>
        <Input id="order" name="order" type="number" defaultValue={member?.order ?? 0} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
