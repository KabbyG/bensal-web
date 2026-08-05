import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { BackToTop } from "@/components/layout/back-to-top";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { getCompany, getMenu } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [company, primaryLinks, footerLinks] = await Promise.all([
    getCompany(),
    getMenu("primary"),
    getMenu("footer"),
  ]);

  return (
    <>
      <ScrollProgress />
      <Navbar company={company} links={primaryLinks} />
      <main>{children}</main>
      <Footer company={company} links={footerLinks} />
      <WhatsAppButton whatsapp={company.whatsapp} />
      <BackToTop />
      <CookieConsent />
    </>
  );
}
