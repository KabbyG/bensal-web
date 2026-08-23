"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { updateCompany } from "@/actions/admin/company";
import { DEFAULT_COMPANY_DATA } from "@/lib/admin/default-company-data";
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
type ContractPoint = {
  year: number;
  cleaning: number | null;
  fumigation: number | null;
  ictEquipment: number | null;
  buildingMaterials: number | null;
  cleaningProducts: number | null;
};

const CONTRACT_SERIES: { key: keyof Omit<ContractPoint, "year">; label: string }[] = [
  { key: "cleaning", label: "Cleaning & Gardening" },
  { key: "fumigation", label: "Fumigation & Pest Control" },
  { key: "ictEquipment", label: "Supply of ICT Equipment" },
  { key: "buildingMaterials", label: "Supply of Building Materials" },
  { key: "cleaningProducts", label: "Supply of Cleaning Products" },
];

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

  function updateRow(i: number, patch: Partial<ContractPoint>) {
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  function addYear() {
    const nextYear = rows.length ? Math.max(...rows.map((r) => r.year)) + 1 : new Date().getFullYear();
    setRows((r) => [
      ...r,
      {
        year: nextYear,
        cleaning: 0,
        fumigation: 0,
        ictEquipment: 0,
        buildingMaterials: 0,
        cleaningProducts: 0,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        One row per financial year. Leave a service blank if that year has no figure — the chart line skips it
        instead of dropping to zero.
      </p>
      <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[5rem_repeat(5,1fr)_2.5rem]">
        <span>Year</span>
        {CONTRACT_SERIES.map((s) => (
          <span key={s.key}>{s.label}</span>
        ))}
        <span />
      </div>
      {rows
        .map((row, i) => ({ row, i }))
        .sort((a, b) => a.row.year - b.row.year)
        .map(({ row, i }) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-2 sm:grid-cols-[5rem_repeat(5,1fr)_2.5rem] sm:border-0 sm:p-0">
            <Input
              aria-label="Year"
              placeholder="Year"
              type="number"
              value={row.year}
              onChange={(e) => updateRow(i, { year: Number(e.target.value) })}
            />
            {CONTRACT_SERIES.map((s) => (
              <Input
                key={s.key}
                aria-label={s.label}
                placeholder={s.label}
                type="number"
                min={0}
                value={row[s.key] ?? ""}
                onChange={(e) => updateRow(i, { [s.key]: e.target.value ? Number(e.target.value) : null })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="col-span-2 sm:col-span-1"
              onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sm:hidden">Remove row</span>
            </Button>
          </div>
        ))}
      <Button type="button" variant="outline" size="sm" onClick={addYear}>
        <Plus className="h-3.5 w-3.5" /> Add year
      </Button>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
    </div>
  );
}

export function CompanyForm({ company }: { company: Company | null }) {
  const [pending, startTransition] = useTransition();
  const c = company ?? DEFAULT_COMPANY_DATA;
  const socials = (c.socials as Record<string, string>) ?? {};

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
            <Input id="name" name="name" defaultValue={c.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="legalName">Legal name</Label>
            <Input id="legalName" name="legalName" defaultValue={c.legalName} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input id="slogan" name="slogan" defaultValue={c.slogan} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foundedYear">Founded year</Label>
            <Input id="foundedYear" name="foundedYear" type="number" defaultValue={c.foundedYear} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staffCount">Staff count</Label>
            <Input id="staffCount" name="staffCount" defaultValue={c.staffCount} required />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="description" label="About / history" defaultValue={c.description} />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="mission" label="Mission" defaultValue={c.mission} />
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor name="vision" label="Vision" defaultValue={c.vision} />
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
            <Input id="email" name="email" type="email" defaultValue={c.email} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Primary phone</Label>
            <Input id="phone" name="phone" defaultValue={c.phone} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={c.whatsapp} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mapEmbedUrl">Map embed URL</Label>
            <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={c.mapEmbedUrl ?? ""} />
          </div>
          <TagInput name="altEmails" label="Alternate emails" defaultValue={c.altEmails} />
          <TagInput name="altPhones" label="Alternate phones" defaultValue={c.altPhones} />
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={c.address} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={c.city} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={c.country} required />
          </div>
          <TagInput name="branches" label="Branches" defaultValue={c.branches} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business hours</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessHoursEditor name="businessHours" defaultValue={(c.businessHours as BusinessHour[]) ?? []} />
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
          <StatsEditor name="stats" defaultValue={(c.stats as Stat[]) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract history (chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractHistoryEditor name="contractHistory" defaultValue={(c.contractHistory as ContractPoint[]) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <ImageUploadField name="logoFile" label="Logo" defaultUrl={c.logoUrl} />
          <ImageUploadField name="logoInverseFile" label="Inverse logo (white)" defaultUrl={c.logoInverseUrl} />
          <ImageUploadField name="faviconFile" label="Favicon" defaultUrl={c.faviconUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">Default SEO title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={c.seoTitle ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Default SEO description</Label>
            <Textarea id="seoDescription" name="seoDescription" defaultValue={c.seoDescription ?? ""} rows={3} />
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
