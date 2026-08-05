import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { getCompany } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { ContactForm } from "@/components/forms/contact-form";
import { SocialLinks } from "@/components/layout/social-links";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Bensal Investment Co. Ltd. — head office, phone, email, and WhatsApp.",
};

type BusinessHour = { day: string; open: string; close: string };

export default async function ContactPage() {
  const company = await getCompany();
  const hours = company.businessHours as unknown as BusinessHour[];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="We'd love to hear from you"
        description="Reach out for quotations, service inquiries, or general questions."
        crumb="Contact"
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <FadeIn className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h3 className="font-display text-lg font-semibold">Head Office</h3>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-muted-foreground">
                    {company.address}, {company.city}, {company.country}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-accent" />
                  <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="text-muted-foreground hover:text-accent">
                    {company.phone}
                  </a>
                </div>
                {company.altPhones.map((phone) => (
                  <div key={phone} className="flex items-center gap-3 pl-8">
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-muted-foreground hover:text-accent">
                      {phone} <span className="text-xs">(alternate)</span>
                    </a>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-accent" />
                  <a href={`mailto:${company.email}`} className="text-muted-foreground hover:text-accent">
                    {company.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="h-5 w-5 shrink-0 text-[#25D366]" />
                  <a
                    href={`https://wa.me/${company.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {Object.values((company.socials as Record<string, string>) ?? {}).some(Boolean) && (
                <div className="mt-6 border-t border-border pt-6">
                  <h4 className="text-sm font-semibold text-muted-foreground">Follow us</h4>
                  <SocialLinks
                    socials={company.socials as Record<string, string>}
                    variant="light"
                    className="mt-3"
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-8">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="h-5 w-5 text-accent" /> Business Hours
              </h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {hours.map((h) => (
                  <li key={h.day} className="flex items-center justify-between text-muted-foreground">
                    <span>{h.day}</span>
                    <span className="font-medium text-foreground">
                      {h.close ? `${h.open} – ${h.close}` : h.open}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {company.mapEmbedUrl && (
              <div className="overflow-hidden rounded-3xl border border-border">
                <iframe
                  src={company.mapEmbedUrl}
                  className="h-64 w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bensal Investment Co. Ltd. — Head Office Map"
                />
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.1}>
            <ContactForm />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
