import { getCompanyOrNull } from "@/lib/queries";
import { CompanyForm } from "@/components/admin/company-form";

export default async function AdminCompanyPage() {
  const company = await getCompanyOrNull();

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Company Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything on the public site — identity, contact details, stats, and branding — comes from here.
      </p>
      {!company && (
        <p className="mt-4 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          No company record exists yet, so the public site can&apos;t render. The fields below are pre-filled with
          Bensal&apos;s real profile — review them and click <strong>Save changes</strong> to create it.
        </p>
      )}
      <div className="mt-6 max-w-3xl">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
