import { getCompany } from "@/lib/queries";
import { CompanyForm } from "@/components/admin/company-form";

export default async function AdminCompanyPage() {
  const company = await getCompany();

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Company Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything on the public site — identity, contact details, stats, and branding — comes from here.
      </p>
      <div className="mt-6 max-w-3xl">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
