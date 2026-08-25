"use client";

import * as React from "react";
import { toast } from "sonner";
import type { NestProfile } from "@/lib/generated/prisma/client";
import { updateNestProfile } from "@/actions/admin/nest";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/components/admin/file-upload-field";

export function NestForm({ profile }: { profile: NestProfile | null }) {
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateNestProfile(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NEST business line</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Intro description</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              defaultValue={
                profile?.description ??
                "Explore our full NeST business line and see the range we're registered to supply."
              }
            />
          </div>

          <FileUploadField
            name="pdfFile"
            label="Business line certificate (PDF)"
            accept="application/pdf"
            defaultUrl={profile?.pdfUrl}
            defaultName={profile?.pdfName}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
