import type { Metadata } from "next";
import { getCompany } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Bensal Investment Co. Ltd. collects, uses, and protects your information.",
};

export default async function PrivacyPolicyPage() {
  const company = await getCompany();

  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" crumb="Privacy Policy" />
      <Section>
        <Container className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert prose-headings:font-display">
          <p className="text-sm text-muted-foreground">
            This is a general-purpose privacy policy template. We recommend having it reviewed by
            qualified legal counsel before relying on it as your official policy.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            When you use our contact form, request a quotation, apply for a job, or subscribe to
            our newsletter, we collect the information you provide directly — such as your name,
            email address, phone number, company name, and any files you upload.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information you provide to respond to inquiries, process quotation and job
            applications, send newsletter updates (only if you subscribe), and improve our
            services. We do not sell your personal information to third parties.
          </p>

          <h2>3. Data Storage &amp; Security</h2>
          <p>
            Submitted information is stored securely in our database and uploaded files are
            validated for type and size before storage. Access is restricted to authorized staff.
          </p>

          <h2>4. Cookies</h2>
          <p>
            We use cookies to improve your browsing experience. You can control cookie preferences
            through your browser settings.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by
            contacting us at{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            {company.legalName}
            <br />
            {company.address}, {company.city}, {company.country}
            <br />
            {company.email} · {company.phone}
          </p>
        </Container>
      </Section>
    </>
  );
}
