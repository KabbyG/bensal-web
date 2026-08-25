import { getNestProfile } from "@/lib/queries";
import { NestForm } from "@/components/admin/nest-form";

export default async function AdminNestPage() {
  const profile = await getNestProfile();

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">NEST Business Lines</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Controls the intro text and certificate PDF shown on the public{" "}
        <code className="rounded bg-surface-muted px-1 py-0.5">/nest</code> page, linked from the navbar.
      </p>
      {!profile?.pdfUrl && (
        <p className="mt-4 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          No PDF uploaded yet — the public page will show the description only until you add one below.
        </p>
      )}
      <div className="mt-6 max-w-2xl">
        <NestForm profile={profile} />
      </div>
    </div>
  );
}
