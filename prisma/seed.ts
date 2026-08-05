import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

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
  const companyData = {
    name: "Bensal Investment",
    legalName: "Bensal Investment Co. Ltd.",
    slogan:
      "We are the best in Cleaning & Gardening, Fumigation, Supply of Electronics, ICT Equipment, and Building Materials that provide quality services for customer satisfaction in Tanzania, and we are well prepared to compete globally.",
    description:
      "Bensal Investment Co. Ltd. is a privately owned company established in 2014 as a business corporation in Tanzania. The company basically deals with Cleaning & Gardening, Fumigation, Supply of Electronics, ICT Equipment, and Building Materials. It has more than 50 staff, including some professionals.",
    mission:
      "We are the best in Cleaning & Gardening, Fumigation, Supply of Electronics, ICT Equipment, and Building Materials that provide quality services for customer satisfaction in Tanzania.",
    vision:
      "We are well prepared to compete globally, extending the same quality and professionalism that has driven our growth across Tanzania.",
    foundedYear: 2014,
    staffCount: "50+",
    email: "md@bensal.co.tz",
    altEmails: ["benjamin.mtani66@gmail.com", "bensalinvestmentcoltd@gmail.com"],
    phone: "+255 716 575 253",
    altPhones: ["+255 692 484 800"],
    whatsapp: "255716575253",
    address: "IPS Building, Azikiwe Street",
    city: "Dar es Salaam",
    country: "Tanzania",
    mapEmbedUrl:
      "https://www.google.com/maps?q=IPS+Building+Azikiwe+Street+Dar+es+Salaam+Tanzania&output=embed",
    // Not specified in the source profile — reasonable East Africa business
    // defaults, editable by the admin once real hours are confirmed.
    businessHours: [
      { day: "Monday – Friday", open: "08:00", close: "17:00" },
      { day: "Saturday", open: "08:00", close: "13:00" },
      { day: "Sunday", open: "Closed", close: "" },
    ],
    // No social media links were found in the source material — placeholders
    // so the icons render; replace with real URLs via Admin > Company Settings.
    socials: { facebook: "#", instagram: "#", linkedin: "#" },
    stats: [
      { label: "Business Growth", value: 85, suffix: "%" },
      { label: "Business Sales", value: 80, suffix: "%" },
    ],
    branches: [
      "Dar es Salaam (Head Office)",
      "Morogoro",
      "Mbeya",
      "Dodoma",
      "Mwanza",
      "Pwani",
      "Tanga",
      "Arusha",
      "Kilimanjaro",
    ],
    // Contract-volume infographic from the profile. Years/series left as
    // `null` where the source did not state an exact figure.
    contractHistory: [
      { year: 2019, cleaning: 0, fumigation: 7 },
      { year: 2020, cleaning: 7, fumigation: 5 },
      { year: 2021, cleaning: 9, fumigation: null },
      { year: 2022, cleaning: 8, fumigation: 6 },
      { year: 2023, cleaning: null, fumigation: 6 },
      { year: 2024, cleaning: null, fumigation: 6 },
      { year: 2025, cleaning: 6, fumigation: 2 },
    ],
    logoUrl: "/brand/logo.png",
    logoInverseUrl: "/brand/logo-inverse.png",
    faviconUrl: "/brand/icon.png",
    seoTitle: "Bensal Investment Co. Ltd. | Cleaning, Fumigation & Supply — Tanzania",
    seoDescription:
      "Bensal Investment Co. Ltd. — Cleaning & Gardening, Fumigation & Pest Control, Electronics & ICT Equipment Supply, and Building Materials Supply across Tanzania since 2014.",
  };

  if (existingCompany) {
    await prisma.company.update({ where: { id: existingCompany.id }, data: companyData });
  } else {
    await prisma.company.create({ data: companyData });
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
        "We aim to be the best in providing quality cleaning and hygiene solutions for customer satisfaction, covering commercial, residential, and industrial needs.",
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
