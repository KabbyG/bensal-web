import { getCompany } from "@/lib/queries";
import { Hero } from "@/components/home/hero";
import { Overview } from "@/components/home/overview";
import { Partners } from "@/components/home/partners";
import { Stats } from "@/components/home/stats";
import { ContractChart } from "@/components/home/contract-chart";
import { Branches } from "@/components/home/branches";
import { Cta } from "@/components/home/cta";
import { ContactPreview } from "@/components/home/contact-preview";

export default async function Home() {
  const company = await getCompany();

  return (
    <>
      <Hero company={company} />
      <Overview company={company} />
      <Partners />
      <Stats company={company} />
      <ContractChart company={company} />
      <Branches company={company} />
      <Cta company={company} />
      <ContactPreview company={company} />
    </>
  );
}
