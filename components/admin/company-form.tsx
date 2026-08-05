"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { updateCompany } from "@/actions/admin/company";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { TagInput } from "@/components/admin/tag-input";

type BusinessHour = { day: string; open: string; close: string };
type Stat = { label: string; value: number; suffix?: string };
type ContractPoint = { year: number; cleaning: number | null; fumigation: number | null };

const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "twitter"] as const;

function BusinessHoursEditor({ name, defaultValue }: { name: string; defaultValue: BusinessHour[] }) {
  const [rows, setRows] = React.useState<BusinessHour[]>(defaultValue);
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Day (e.g. Mon–Fri)"
            value={row.day}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, day: e.target.value } : x)))}
          />
          <Input
            placeholder="Open"
            value={row.open}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, open: e.target.value } : x)))}
          />
          <Input
            placeholder="Close"
            value={row.close}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, close: e.target.value } : x)))}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((r) => [...r, { day: "", open: "", close: "" }])}
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </Button>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
    </div>
  );
}

function StatsEditor({ name, defaultValue }: { name: string; defaultValue: Stat[] }) {
  const [rows, setRows] = React.useState<Stat[]>(defaultValue);
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Label"
            value={row.label}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
          />
          <Input
            placeholder="Value"
            type="number"
            value={row.value}
            onChange={(e) =>
              setRows((r) => r.map((x, idx) => (idx === i ? { ...x, value: Number(e.target.value) } : x)))
            }
          />
          <Input
            placeholder="Suffix (e.g. +)"
            value={row.suffix ?? ""}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, suffix: e.target.value } : x)))}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((r) => [...r, { label: "", value: 0, suffix: "" }])}
      >
        <Plus className="h-3.5 w-3.5" /> Add stat
      </Button>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
    </div>
  );
}

function SocialsEditor({ name, defaultValue }: { name: string; defaultValue: Record<string, string> }) {
  const [values, setValues] = React.useState<Record<string, string>>(defaultValue);
  return (
    <>
      {SOCIAL_KEYS.map((key) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`social-${key}`} className="capitalize">
            {key}
          </Label>
          <Input
            id={`social-${key}`}
            value={values[key] ?? ""}
            placeholder="https://"
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          />
        </div>
      ))}
      <input type="hidden" name={name} value={JSON.stringify(values)} readOnly />
    </>
  );
}

function ContractHistoryEditor({ name, defaultValue }: { name: string; defaultValue: ContractPoint[] }) {
  const [rows, setRows] = React.useState<ContractPoint[]>(defaultValue);
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Year"
            type="number"
            value={row.year}
            onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, year: Number(e.target.value) } : x)))}
          />
          <Input
            placeholder="Cleaning contracts"
            type="number"
            value={row.cleaning ?? ""}
            onChange={(e) =>
              setRows((r) =>
                r.map((x, idx) => (idx === i ? { ...x, cleaning: e.target.value ? Number(e.target.value) : null } : x))
              )
            }
          />
          <Input
            placeholder="Fumigation contracts"
            type="number"
            value={row.fumigation ?? ""}
            onChange={(e) =>
              setRows((r) =>
                r.map((x, idx) => (idx === i ? { ...x, fumigation: e.target.value ? Number(e.target.value) : null } : x))
              )
            }
          />
          <Button type="button" variant="outline" size="icon" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((r) => [...r, { year: new Date().getFullYear(), cleaning: 0, fumigation: 0 }])}
      >
        <Plus className="h-3.5 w-3.5" /> Add year
      </Button>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
    </div>
  );
}

export function CompanyForm({ company }: { company: Company }) {
  const [pending, startTransition] = useTransition();
  const socials = (company.socials as Record<string, string>) ?? {};

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCompany(formData);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" defaultValue={company.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="legalName">Legal name</Label>
            <Input id="legalName" name="legalName" defaultValue={company.legalName} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input id="slogan" name="slogan" defaultValue={company.slogan} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foundedYear">Founded year</Label>
            <Input id="foundedYear" name="foundedYear" type="number" defaultValue={company.foundedYear} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staffCount">Staff count</Label>
            <Input id="staffCount" name="staffCount" defaultValue={company.staffCount} required />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="description" label="About / history" defaultValue={company.description} />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="mission" label="Mission" defaultValue={company.mission} />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="vision" label="Vision" defaultValue={company.vision} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Primary email</Label>
            <Input id="email" name="email" type="email" defaultValue={company.email} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Primary phone</Label>
            <Input id="phone" name="phone" defaultValue={company.phone} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={company.whatsapp} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mapEmbedUrl">Map embed URL</Label>
            <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={company.mapEmbedUrl ?? ""} />
          </div>
          <TagInput name="altEmails" label="Alternate emails" defaultValue={company.altEmails} />
          <TagInput name="altPhones" label="Alternate phones" defaultValue={company.altPhones} />
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={company.address} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={company.city} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={company.country} required />
          </div>
          <TagInput name="branches" label="Branches" defaultValue={company.branches} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business hours</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessHoursEditor name="businessHours" defaultValue={(company.businessHours as BusinessHour[]) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SocialsEditor name="socials" defaultValue={socials} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage stats</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsEditor name="stats" defaultValue={(company.stats as Stat[]) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract history (chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractHistoryEditor name="contractHistory" defaultValue={(company.contractHistory as ContractPoint[]) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <ImageUploadField name="logoFile" label="Logo" defaultUrl={company.logoUrl} />
          <ImageUploadField name="logoInverseFile" label="Inverse logo (white)" defaultUrl={company.logoInverseUrl} />
          <ImageUploadField name="faviconFile" label="Favicon" defaultUrl={company.faviconUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">Default SEO title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={company.seoTitle ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Default SEO description</Label>
            <Textarea id="seoDescription" name="seoDescription" defaultValue={company.seoDescription ?? ""} rows={3} />
          </div>
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
