import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DEFAULT_COMPANY_DATA } from "../lib/admin/default-company-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// All copy below is sourced directly from info/BENPROFILE.pdf and the
// Bensal Investment brand assets (info/Bensal Investment/). Where the PDF
// did not give a distinct paragraph for a section (marked below), the text
// is a short, factual, non-promotional summary derived only from the
// section heading itself — never invented figures, clients, or claims.

async function main() {
  // --- Roles & seeded admin -------------------------------------------------
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });
  await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: {},
    create: { name: "EDITOR" },
  });
  await prisma.role.upsert({
    where: { name: "STAFF" },
    update: {},
    create: { name: "STAFF" },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@bensal.co.tz";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD is not set in .env — refusing to seed an admin user without one."
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME ?? "Bensal Admin",
      email: adminEmail,
      password: passwordHash,
      roleId: adminRole.id,
    },
  });

  // --- Company (singleton) ---------------------------------------------------
  const existingCompany = await prisma.company.findFirst();

  if (existingCompany) {
    await prisma.company.update({ where: { id: existingCompany.id }, data: DEFAULT_COMPANY_DATA });
  } else {
    await prisma.company.create({ data: DEFAULT_COMPANY_DATA });
  }

  // --- Leadership --------------------------------------------------------
  await prisma.teamMember.deleteMany({ where: { isLeadership: true } });
  await prisma.teamMember.createMany({
    data: [
      {
        name: "CPA Abdulshakur Mtani",
        title: "Managing Director",
        isLeadership: true,
        order: 0,
      },
      {
        name: "Eng. Benjamin Masige",
        title: "Technical Director",
        isLeadership: true,
        order: 1,
      },
    ],
  });

  // --- Services ------------------------------------------------------------
  const services = [
    {
      slug: "cleaning-gardening",
      title: "Cleaning & Gardening",
      shortDescription:
        "Quality cleaning and hygiene solutions for commercial, residential, and industrial needs.",
      description:
        "<p>We aim to be the best in providing quality cleaning and hygiene solutions for customer satisfaction, covering commercial, residential, and industrial needs.</p>",
      items: [
        "Building and Compound Cleaning Services",
        "Laundry Services (includes housekeeping, yard/pool care, dry cleaning)",
      ],
      icon: "Sparkles",
      order: 0,
    },
    {
      slug: "fumigation-pest-control",
      title: "Fumigation & Pest Control",
      shortDescription:
        "Protecting assets and people from pests with professionalism and compliance.",
      description:
        "Our fumigation and pest control services are designed to protect your assets and people from pests with professionalism and compliance.",
      icon: "Bug",
      order: 1,
    },
    {
      // The source profile did not include distinct body copy for this
      // service (a layout/extraction artifact duplicated the fumigation
      // paragraph here) — this description is a short factual summary
      // derived only from the section heading.
      slug: "electronics-ict-supply",
      title: "Supply of Electronics & ICT Equipment",
      shortDescription:
        "Reliable supply of electronics and ICT equipment for businesses and institutions.",
      description:
        "We supply a wide range of electronics and Information & Communications Technology (ICT) equipment, helping businesses and institutions across Tanzania access reliable technology.",
      icon: "Cpu",
      order: 2,
    },
    {
      // Same note as above — summary derived from the section heading only.
      slug: "building-materials-supply",
      title: "Supply of Building Materials",
      shortDescription:
        "Quality building materials supplied reliably for construction and infrastructure projects.",
      description:
        "We supply quality building materials for construction and infrastructure projects, supporting contractors, developers, and institutions across our branch network.",
      icon: "Building2",
      order: 3,
    },
    {
      slug: "cleaning-materials-supply",
      title: "Supply of Cleaning Materials",
      shortDescription:
        "Detergents, disinfectants, and everyday cleaning supplies delivered in bulk to offices, hotels, and institutions.",
      description:
        "Beyond our cleaning services, we also supply the materials behind them — detergents, disinfectants, tissue and hygiene products, and general cleaning consumables — delivered in bulk so offices, hotels, and institutions always have what they need on hand without chasing multiple suppliers.",
      icon: "SprayCan",
      order: 4,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  // --- Product categories (placeholders — real SKUs added via admin) -------
  const categories = [
    {
      slug: "electronics-ict",
      name: "Electronics & ICT Equipment",
      description: "Electronics and Information & Communications Technology equipment.",
      order: 0,
    },
    {
      slug: "building-materials",
      name: "Building Materials",
      description: "Materials for construction and infrastructure projects.",
      order: 1,
    },
  ];

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // --- Navigation menus (drives Navbar + Footer "Explore" list) ------------
  // Seeded from the site's original static lib/nav-links.ts list so switching
  // the navbar/footer to DB-driven menus is a no-op until edited in /admin/menus.
  const defaultLinks = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Services", url: "/services" },
    { label: "Products", url: "/products" },
    { label: "Projects", url: "/projects" },
    { label: "Gallery", url: "/gallery" },
    { label: "News", url: "/news" },
    { label: "Careers", url: "/careers" },
    { label: "Contact", url: "/contact" },
  ];

  for (const [key, label] of [
    ["primary", "Primary Navigation"],
    ["footer", "Footer Explore"],
  ] as const) {
    const menu = await prisma.menu.upsert({
      where: { key },
      update: { label },
      create: { key, label },
    });
    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    await prisma.menuItem.createMany({
      data: defaultLinks.map((link, order) => ({
        menuId: menu.id,
        label: link.label,
        url: link.url,
        order,
      })),
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / (password from SEED_ADMIN_PASSWORD in .env)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
