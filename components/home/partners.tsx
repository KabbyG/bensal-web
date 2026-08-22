import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp"]);

const LABELS: Record<string, string> = {
  tasac: "TASAC",
  tcra: "TCRA",
  nimr: "National Institute for Medical Research",
  udom: "The University of Dodoma",
  "mzumbe-university": "Mzumbe University",
  tanapa: "Tanzania National Parks",
  "orci-ministry-of-health": "Ocean Road Cancer Institute",
  tanroads: "TANROADS",
  taa: "Tanzania Airports Authority",
  tantrade: "TanTrade",
  nssf: "NSSF",
  tra: "Tanzania Revenue Authority",
  tcb: "Tanzania Cotton Board",
  nic: "National Insurance Corporation",
  tia: "Tanzania Institute of Accountancy",
  udsm: "University of Dar es Salaam",
  latra: "LATRA",
};

function humanize(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPartnerLogos() {
  const dir = path.join(process.cwd(), "public/partners");

  let files: string[] = [];
  try {
    files = fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }

  return files
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => {
      const slug = path.basename(file, path.extname(file));
      return {
        src: `/partners/${file}`,
        alt: LABELS[slug] ?? humanize(slug),
      };
    });
}

export function Partners() {
  const logos = getPartnerLogos();

  if (logos.length === 0) return null;

  const track = [...logos, ...logos];

  return (
    <Section className="overflow-hidden bg-surface-muted py-16 sm:py-20">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Our Partners
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            Trusted by leading organizations across Tanzania
          </h2>
        </FadeIn>
      </Container>

      <div className="group relative mt-12 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-6 group-hover:[animation-play-state:paused] sm:gap-8">
          {track.map((logo, index) => (
            <div
              key={`${logo.src}-${index}`}
              className="relative flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:h-24 sm:w-48"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="192px"
                className="object-contain p-4 sm:p-5"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
