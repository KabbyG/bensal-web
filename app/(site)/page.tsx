import { getCompany, getServices } from "@/lib/queries";
import { Hero } from "@/components/home/hero";
import { Overview } from "@/components/home/overview";
import { ServicesHighlight } from "@/components/home/services-highlight";
import { Stats } from "@/components/home/stats";
import { ContractChart } from "@/components/home/contract-chart";
import { Branches } from "@/components/home/branches";
import { Cta } from "@/components/home/cta";
import { ContactPreview } from "@/components/home/contact-preview";

export default async function Home() {
  const [company, services] = await Promise.all([getCompany(), getServices()]);

  return (
    <>
      <Hero company={company} />
      <Overview company={company} />
      <ServicesHighlight services={services} />
      <Stats company={company} />
      <ContractChart company={company} />
      <Branches company={company} />
      <Cta company={company} />
      <ContactPreview company={company} />
    </>
  );
}
