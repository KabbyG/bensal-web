import type { Metadata } from "next";
import { getCompany } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Bensal Investment Co. Ltd. website.",
};

export default async function TermsPage() {
  const company = await getCompany();

  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" crumb="Terms & Conditions" />
      <Section>
        <Container className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert prose-headings:font-display">
          <p className="text-sm text-muted-foreground">
            This is a general-purpose terms template. We recommend having it reviewed by qualified
            legal counsel before relying on it as your official terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by these terms
            and conditions.
          </p>

          <h2>2. Use of Website</h2>
          <p>
            This website and its content are provided by {company.legalName} for informational
            purposes about our services and products. You agree not to misuse the site, including
            submitting fraudulent quotation requests, job applications, or contact messages.
          </p>

          <h2>3. Quotations &amp; Services</h2>
          <p>
            Quotation requests submitted through this website are not binding offers. Final
            pricing and service agreements are confirmed directly with our team.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website, including the {company.name} name, logo, and brand
            assets, is the property of {company.legalName} and may not be used without permission.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            {company.legalName} is not liable for any indirect, incidental, or consequential
            damages arising from the use of this website.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        </Container>
      </Section>
    </>
  );
}
